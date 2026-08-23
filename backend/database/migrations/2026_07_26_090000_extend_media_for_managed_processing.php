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
        Schema::table('media', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->after('id');
            $table->string('source_path')->nullable()->after('path');
            $table->string('processed_path')->nullable()->after('source_path');
            $table->string('source_checksum', 64)->nullable()->after('processed_path');
            $table->string('output_checksum', 64)->nullable()->after('source_checksum');
            $table->string('original_mime_type', 100)->nullable()->after('mime_type');
            $table->unsignedBigInteger('original_size')->nullable()->after('size');
            $table->unsignedInteger('width')->nullable()->after('original_size');
            $table->unsignedInteger('height')->nullable()->after('width');
            $table->string('status', 24)->default('ready')->after('height');
            $table->uuid('batch_uuid')->nullable()->after('status');
            $table->string('fallback_reference')->nullable()->after('batch_uuid');
            $table->unsignedSmallInteger('processor_version')->default(1)->after('fallback_reference');
            $table->text('error_message')->nullable()->after('processor_version');
            $table->timestamp('processed_at')->nullable()->after('error_message');
        });

        DB::table('media')->orderBy('id')->each(function ($row): void {
            DB::table('media')->where('id', $row->id)->update([
                'uuid' => (string) Str::uuid(),
                'processed_path' => $row->path,
                'original_mime_type' => $row->mime_type,
                'original_size' => $row->size,
                'status' => 'ready',
                'processed_at' => $row->updated_at ?: now(),
            ]);
        });

        Schema::table('media', function (Blueprint $table) {
            $table->unique('uuid');
            $table->unique(['source_checksum', 'processor_version'], 'media_source_processor_unique');
            $table->index(['status', 'created_at']);
            $table->index('batch_uuid');
        });
    }

    public function down(): void
    {
        Schema::table('media', function (Blueprint $table) {
            $table->dropUnique(['uuid']);
            $table->dropUnique('media_source_processor_unique');
            $table->dropIndex(['status', 'created_at']);
            $table->dropIndex(['batch_uuid']);
            $table->dropColumn([
                'uuid',
                'source_path',
                'processed_path',
                'source_checksum',
                'output_checksum',
                'original_mime_type',
                'original_size',
                'width',
                'height',
                'status',
                'batch_uuid',
                'fallback_reference',
                'processor_version',
                'error_message',
                'processed_at',
            ]);
        });
    }
};
