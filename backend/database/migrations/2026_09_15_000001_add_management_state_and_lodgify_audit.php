<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('villa_caches', function (Blueprint $table) {
            $table->string('management_status', 32)->default('managed')->index()->after('lodgify_status');
            $table->timestamp('management_status_changed_at')->nullable()->after('management_status');
            $table->unsignedBigInteger('management_status_changed_by')->nullable()->after('management_status_changed_at');
            $table->string('management_status_note', 500)->nullable()->after('management_status_changed_by');
            $table->index(['lodgify_status', 'management_status'], 'villa_caches_public_eligibility_idx');
        });

        Schema::create('lodgify_property_events', function (Blueprint $table) {
            $table->id();
            $table->uuid('event_uuid')->unique();
            $table->string('event_key', 64)->unique();
            $table->foreignId('sync_run_id')->nullable()->constrained('lodgify_sync_runs')->nullOnDelete();
            $table->foreignId('villa_cache_id')->nullable()->constrained('villa_caches')->nullOnDelete();
            $table->string('lodgify_id', 32)->index();
            $table->string('event_type', 64)->index();
            $table->string('previous_lodgify_status', 32)->nullable();
            $table->string('new_lodgify_status', 32)->nullable();
            $table->string('previous_management_status', 32)->nullable();
            $table->string('new_management_status', 32)->nullable();
            $table->json('changes')->nullable();
            $table->string('previous_hash', 64)->nullable();
            $table->string('current_hash', 64)->nullable();
            $table->string('actor_type', 32)->default('system');
            $table->unsignedBigInteger('actor_id')->nullable();
            $table->string('reason', 500)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('occurred_at')->index();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['lodgify_id', 'occurred_at'], 'lodgify_property_events_timeline_idx');
        });

        $now = now();
        $decisions = [
            '494871' => ['temporarily_unavailable', 'Villa remains managed and is temporarily unavailable.'],
            '598367' => ['temporarily_unavailable', 'Villa remains managed and is temporarily unavailable.'],
            '707108' => ['temporarily_unavailable', 'Villa remains managed and is temporarily unavailable.'],
            '831493' => ['temporarily_unavailable', 'Villa remains managed and is temporarily unavailable.'],
            '818095' => ['removed_from_portfolio', 'Villa is no longer managed by Summerhouse.'],
            '796460' => ['removed_from_portfolio', 'Villa is no longer managed by Summerhouse.'],
        ];

        foreach ($decisions as $lodgifyId => [$decision, $note]) {
            $villa = DB::table('villa_caches')->where('lodgify_id', $lodgifyId)->first();
            if (! $villa) {
                continue;
            }

            $managementStatus = $decision === 'removed_from_portfolio' ? 'removed_from_portfolio' : 'managed';
            DB::table('villa_caches')->where('id', $villa->id)->update([
                'management_status' => $managementStatus,
                'management_status_changed_at' => $now,
                'management_status_note' => $note,
            ]);

            DB::table('lodgify_property_events')->insert([
                'event_uuid' => (string) Str::uuid(),
                'event_key' => hash('sha256', "client-confirmation:2026-09-14:{$lodgifyId}:{$decision}"),
                'villa_cache_id' => $villa->id,
                'lodgify_id' => $lodgifyId,
                'event_type' => 'client_decision_recorded',
                'previous_lodgify_status' => $villa->lodgify_status ?? null,
                'new_lodgify_status' => $villa->lodgify_status ?? null,
                'previous_management_status' => 'managed',
                'new_management_status' => $managementStatus,
                'changes' => json_encode(['client_decision' => ['from' => null, 'to' => $decision]], JSON_THROW_ON_ERROR),
                'actor_type' => 'client_confirmation',
                'reason' => $note,
                'metadata' => json_encode(['confirmed_at' => '2026-09-14'], JSON_THROW_ON_ERROR),
                'occurred_at' => $now,
                'created_at' => $now,
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('lodgify_property_events');

        Schema::table('villa_caches', function (Blueprint $table) {
            $table->dropIndex('villa_caches_public_eligibility_idx');
            $table->dropIndex(['management_status']);
            $table->dropColumn([
                'management_status',
                'management_status_changed_at',
                'management_status_changed_by',
                'management_status_note',
            ]);
        });
    }
};
