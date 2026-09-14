# Lodgify Production Property Baseline

Audit date: 2026-09-12

Status: Engineering baseline complete, partial client decisions confirmed

## Decision values

- `confirmed_active`
- `confirmed_inactive`
- `replace_property_id`
- `remove_from_website`
- `temporarily_unavailable`
- `removed_from_portfolio`
- `pending_client_confirmation`

## Live API inventory

The complete paginated Lodgify response contains 44 properties: 39 active and 5 inactive.

| Lodgify ID | Property | API state | Client decision |
| --- | --- | --- | --- |
| `475365` | Ubud zen river house | active | pending_client_confirmation |
| `475366` | Casaluna Loft I | active | pending_client_confirmation |
| `475367` | Casaluna Loft III | active | pending_client_confirmation |
| `475370` | Villa Shanti Canggu | active | pending_client_confirmation |
| `475371` | Villa Kita I Canggu | active | pending_client_confirmation |
| `475372` | Cactus Estate Villa Pererenan | active | pending_client_confirmation |
| `475373` | Villa Rindu Canggu | active | pending_client_confirmation |
| `475374` | Casaluna Loft II | active | pending_client_confirmation |
| `475375` | The Atelier Home Canggu | active | pending_client_confirmation |
| `494863` | Studio Lupo Canggu | active | pending_client_confirmation |
| `494867` | Villa Samara Umalas | active | pending_client_confirmation |
| `494870` | Villa Sehati Canggu | active | pending_client_confirmation |
| `494871` | Villa Charli | inactive | temporarily_unavailable |
| `494873` | Villa Joy Pererenan | active | pending_client_confirmation |
| `494977` | Villa Eva Canggu | active | pending_client_confirmation |
| `524256` | 88 East Home Canggu | active | pending_client_confirmation |
| `535816` | Villa Kita IV | active | pending_client_confirmation |
| `555335` | Villa Isa | active | pending_client_confirmation |
| `573606` | Villa Juma Legian | active | pending_client_confirmation |
| `598366` | The Attic Loft | active | pending_client_confirmation |
| `598367` | The Warehouse Loft | inactive | temporarily_unavailable |
| `621443` | Villa Ari Pererenan | active | pending_client_confirmation |
| `635238` | Villa 209 | active | pending_client_confirmation |
| `635239` | Villa 208 | active | pending_client_confirmation |
| `703452` | Corner House Canggu | active | pending_client_confirmation |
| `703453` | Paddy Palace Canggu | active | pending_client_confirmation |
| `704946` | Palazzo Pappagallo Canggu | active | pending_client_confirmation |
| `704947` | Berawa Factory I Canggu | active | pending_client_confirmation |
| `706213` | Nara House Canggu | active | pending_client_confirmation |
| `706260` | Mari Apartment Canggu | active | pending_client_confirmation |
| `707108` | Berawa Factory II Canggu | inactive | temporarily_unavailable |
| `712189` | Loft Tres Pererenan | active | pending_client_confirmation |
| `712190` | Loft Uno Pererenan | active | pending_client_confirmation |
| `759820` | Casa Leone Canggu | active | pending_client_confirmation |
| `759821` | Officina 17 Canggu | active | pending_client_confirmation |
| `760836` | Undici Villa Canggu | active | pending_client_confirmation |
| `760838` | Il Riparo Villa Canggu | active | pending_client_confirmation |
| `761507` | Rumah Mimosa Canggu | active | pending_client_confirmation |
| `762712` | Villa Arta Umalas | active | pending_client_confirmation |
| `811288` | Fondazione Bondarev Ubud | active | pending_client_confirmation |
| `818095` | Villa Semanggi Canggu | inactive | removed_from_portfolio |
| `831493` | Casaluna Umalas (OPS ONLY) | inactive | temporarily_unavailable |
| `838709` | Villa Kubu Taullan II | active | pending_client_confirmation |
| `841456` | Villa Sehati 1 / Central Canggu | active | pending_client_confirmation |

## Properties absent from the live API

| Lodgify ID | Last known property | Current evidence | Client decision |
| --- | --- | --- | --- |
| `796460` | Bawa House / Bawa House Luxury 5BR Tropical Eco Villa | Not in paginated property list; detail endpoint returned HTTP 404; selected in `extended_stays` and `featured_homes` | removed_from_portfolio |
| `751982` | Name unavailable in current cache audit | Not in paginated property list; selected in `short_stays`; detail endpoint returned HTTP 404 | pending_client_confirmation |
| `475368` | Casarosa Villa | Stale admin cache row; not in live property list; detail endpoint returned HTTP 404 | pending_client_confirmation |
| `629648` | Casa Lilo Central Seminyak | Stale admin cache row; not in live property list; detail endpoint returned HTTP 404 | pending_client_confirmation |
| `688824` | Villa Taullan Kerobokan | Stale admin cache row; not in live property list; detail endpoint returned HTTP 404 | pending_client_confirmation |

## Homepage selection exceptions

| Slot | Lodgify ID | Current issue |
| --- | --- | --- |
| `extended_stays` | `796460` | Property missing from Lodgify API |
| `featured_homes` | `796460` | Property missing from Lodgify API |
| `short_stays` | `707108` | Property is inactive in Lodgify |
| `short_stays` | `751982` | Property missing from Lodgify API |

## Safety rule

No row, review, wishlist entry, or homepage selection may be automatically deleted based on this baseline. Client confirmation is required before editorial cleanup or property-ID replacement.

## Client confirmation, 2026-09-14

- Villa Charli (`494871`), The Warehouse Loft (`598367`), Berawa Factory II Canggu (`707108`), and Casaluna Umalas (`831493`) remain managed by Summerhouse and are temporarily unavailable.
- Villa Semanggi Canggu (`818095`) and Bawa House (`796460`) are no longer managed by Summerhouse.
- The client intends to remove the no-longer-managed properties from Lodgify.
- Temporary date-level unavailability should be managed through Lodgify availability or blocked dates. Property-level inactive remains appropriate when the complete property must not be published for an indefinite period.
