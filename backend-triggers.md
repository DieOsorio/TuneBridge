# 🎯 TuneBridge — Database Triggers (Business Logic Only)

> **Scope** : This file lists *only* the triggers that belong to the app‑level schemas (`auth`, `users`, `music`, `social`, `groups`).  
Low‑level system helpers created by Supabase (`pgsodium`, `storage`, `realtime`, `vault`, …) are intentionally omitted.

---

## auth schema

| Trigger                  | Table        | Fired On                | Function                                  | Purpose                                                                                                                                        |
| ------------------------ | ------------ | ----------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `trigger_create_profile` | `auth.users` | **AFTER UPDATE** `role` | `users.create_profile_when_authenticated` | Creates the companion `users.profiles`, default `privacy_settings` and `ui_preferences` rows when a user first gains the `authenticated` role. |

---

## users schema

| Trigger                                 | Table                         | Fired On                   | Function                              | Purpose                                                            |
| --------------------------------------- | ----------------------------- | -------------------------- | ------------------------------------- | ------------------------------------------------------------------ |
| `after_profile_group_insert`            | `users.profile_groups`        | **AFTER INSERT**           | `users.add_creator_to_group_members`  | Adds the group creator as an **admin** to `profile_group_members`. |
| `trigger_group_member_join`             | `users.profile_group_members` | **AFTER INSERT**           | `users.notify_profile_group_join`     | Notification when someone joins a group.                           |
| `trigger_group_member_leave`            | `users.profile_group_members` | **AFTER DELETE**           | `users.notify_profile_group_leave`    | Notification when someone leaves / is removed.                     |
| `trg_reassign_admin_on_leave`           | `users.profile_group_members` | **AFTER DELETE**           | `users.reassign_admin_on_leave`       | Promotes a new admin if the last one left.                         |
| `trg_touch_privacy`                     | `users.privacy_settings`      | **BEFORE UPDATE**          | `users.touch_privacy`                 | Touches `updated_at` timestamp.                                    |
| `trg_touch_ui_prefs`                    | `users.ui_preferences`        | **BEFORE UPDATE**          | `users.touch_ui_prefs`                | Touches `updated_at` timestamp.                                    |
| `trigger_prevent_duplicate_usernames`   | `users.profiles`              | **BEFORE INSERT / UPDATE** | `users.prevent_duplicate_usernames`   | Enforces unique usernames (case‑insensitive).                      |
| `trigger_update_profile_content_search` | `users.profiles`              | **BEFORE INSERT / UPDATE** | `users.update_profile_content_search` | Builds `content_search` (name, bio, location, …).                  |
| `trg_update_content_search_all`         | `users.profiles`              | **AFTER INSERT / UPDATE**  | `users.update_content_search_all`     | Combines all tsvectors into `content_search_all`.                  |

---

## music schema

| Trigger                           | Table         | Fired On                           | Function                                    | Purpose                                                   |
| --------------------------------- | ------------- | ---------------------------------- | ------------------------------------------- | --------------------------------------------------------- |
| `trg_update_content_search_roles` | `music.roles` | **AFTER INSERT / DELETE / UPDATE** | `users.update_content_search_roles_trigger` | Syncs `content_search_roles` whenever a role row changes. |

---

## social schema

### Notifications & Integrity

| Trigger                                          | Table                              | Fired On                              | Function                                        | Purpose                                                    |
| ------------------------------------------------ | ---------------------------------- | ------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------- |
| `trigger_comment`                                | `social.comments`                  | **AFTER INSERT**                      | `social.notify_comment`                         | Notifies the post owner about new comments.                |
| `trigger_update_comment_timestamp`               | `social.comments`                  | **BEFORE UPDATE** *(content)*         | `social.update_comment_timestamp`               | Updates `updated_at` on edits.                             |
| `trigger_like`                                   | `social.likes`                     | **AFTER INSERT**                      | `social.notify_like`                            | Notifies owner when their entity is liked.                 |
| `trigger_prevent_duplicate_likes`                | `social.likes`                     | **BEFORE INSERT**                     | `social.prevent_duplicate_likes`                | Blocks duplicate likes.                                    |
| `trigger_prevent_duplicate_participants`         | `social.conversation_participants` | **BEFORE INSERT**                     | `social.prevent_duplicate_participants`         | Avoids duplicate participants in a conversation.           |
| `trg_set_creator_as_admin`                       | `social.conversations`             | **AFTER UPDATE**                      | `social.set_creator_as_admin`                   | Promotes creator when a conversation becomes a group chat. |
| `trigger_delete_messages_on_conversation_delete` | `social.conversations`             | **AFTER DELETE**                      | `social.delete_messages_on_conversation_delete` | Cascades soft‑delete of messages.                          |
| `trigger_soft_delete_message`                    | `social.messages`                  | **BEFORE DELETE**                     | `social.soft_delete_message`                    | Soft‑delete pattern via `deleted_at`.                      |
| `trigger_update_message_timestamp`               | `social.messages`                  | **BEFORE UPDATE** *(content)*         | `social.update_message_timestamp`               | Updates `updated_at` on edits.                             |
| `trigger_follow_request`                         | `social.user_connections`          | **AFTER INSERT** *(status = pending)* | `social.notify_follow_request`                  | Notifies target user of a follow request.                  |
| `trigger_update_connection_timestamp`            | `social.user_connections`          | **BEFORE UPDATE** *(status)*          | `social.update_connection_timestamp`            | Touches `updated_at`.                                      |

### Search & Full‑Text Vectors

| Trigger                          | Table                     | Fired On                                     | Function                                        | Purpose                                          |
| -------------------------------- | ------------------------- | -------------------------------------------- | ----------------------------------------------- | ------------------------------------------------ |
| `update_content_search_trigger`  | `social.posts`            | **AFTER INSERT / UPDATE**                    | `social.refresh_post_content_search`            | Regenerates post search vector.                  |
| `update_content_search_hashtags` | `social.post_hashtags`    | **AFTER INSERT / DELETE / UPDATE**           | `social.refresh_post_content_search`            | Keeps post search vector in‑sync with hashtags.  |
| `trg_refresh_profile_search`     | `social.profile_hashtags` | **AFTER INSERT / DELETE / UPDATE**           | `social.refresh_profile_content_search_details` | Maintains `content_search_details` for profiles. |
| `trigger_update_post_timestamp`  | `social.posts`            | **BEFORE UPDATE** *(content / images_urls)*  | `social.update_post_timestamp`                  | Touches `updated_at`.                            |

---

## groups schema

| Trigger                               | Table                          | Fired On         | Function                            | Purpose                                                   |
| ------------------------------------- | ------------------------------ | ---------------- | ----------------------------------- | --------------------------------------------------------- |
| `trg_pg_follow_notif`                 | `groups.profile_group_follows` | **AFTER INSERT** | `groups.notify_profile_group_follow`| Sends a notification when a user follows a profile group. |
| `update_rsvp_timestamp_trg`           | `groups.event_rsvps`           | **BEFORE UPDATE**| `groups.update_rsvp_timestamp`      | Touches `updated_at` when an RSVP row is updated.         |

---

## Removed / Deprecated (kept for history)

* `update_like_toggle_trg`, `update_rsvp_timestamp_trg`, `trg_tsv_musician_ads` — no longer present in the database as of **2025‑07‑07**.

---

*Last synchronised with production on **2025‑07‑15***
