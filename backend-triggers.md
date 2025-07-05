# 🎯 TuneBridge Database Triggers Overview  

## public / auth schema (Global / Cross‑table)

- **add_creator_to_group_members_trg**  
  - Table: `users.profile_groups`  
  - Calls function: `add_creator_to_group_members`  
  - Inserts the group creator as **admin** inside `profile_group_members` when a new group is created.  

- **trigger_create_profile**  
  - Table: `auth.users` &nbsp;*(AFTER UPDATE … WHEN role changes)*  
  - Calls function: `users.create_profile_when_authenticated`  
  - Auto‑creates the companion `users.profiles`, default **privacy_settings** and **ui_preferences** rows when a user first obtains the *authenticated* role.  

---

## social.notifications

- **notify_comment_trg**  
  - Table: `social.post_comments`  
  - Calls function: `social.notify_comment`  
  - Creates a notification for the post owner when someone comments.  

- **notify_like_trg**  
  - Table: `social.likes`  
  - Calls function: `social.notify_like`  
  - Notifies the post/comment owner when their content is liked.  

- **notify_follow_request_trg**  
  - Table: `social.user_connections`  
  - Calls function: `social.notify_follow_request`  
  - Notifies a user when they receive a follow request.  

- **notify_profile_group_join_trg**  
  - Table: `users.profile_group_members`  
  - Calls function: `users.notify_profile_group_join`  
  - Sends a notification to a user who just joined a group.  

- **notify_profile_group_leave_trg**  
  - Table: `users.profile_group_members`  
  - Calls function: `users.notify_profile_group_leave`  
  - Handles notifications when members leave or are removed from a group.  

---

## social.likes  &  social.user_connections

- **prevent_duplicate_likes_trg**  
  - Table: `social.likes`  
  - Calls function: `social.prevent_duplicate_likes`  
  - Blocks duplicate likes by the same user on the same entity.  

- **update_like_toggle_trg**  
  - Table: `social.likes`  
  - Calls function: `social.update_like_status`  
  - Toggles like / un‑like behaviour on insert attempts.  

---

## social.conversation_participants / social.conversations

- **prevent_duplicate_participants_trg**  
  - Table: `social.conversation_participants`  
  - Calls function: `social.prevent_duplicate_participants`  
  - Ensures a profile can be added to a conversation only once.  

- **set_creator_as_admin_trg**  
  - Table: `social.conversations`  
  - Calls function: `social.set_creator_as_admin`  
  - When a conversation is converted to a group, promotes the creator to admin.  

- **delete_messages_on_conversation_delete_trg**  
  - Table: `social.conversations`  
  - Calls function: `delete_messages_on_conversation_delete`  
  - Cascades a soft‑delete of all messages belonging to the conversation.  

---

## social.posts / social.post_hashtags

- **refresh_post_content_search_trg**  
  - Tables: `social.posts`, `social.post_hashtags`  
  - Calls function: `social.refresh_post_content_search`  
  - Regenerates the post’s full‑text search vector when content or hashtags change.  

---

## users.profiles, users.profile_hashtags, music.roles

- **update_profile_content_search_trg**  
  - Table: `users.profiles`  
  - Calls function: `users.update_profile_content_search`  
  - Rebuilds the base search vector (`content_search`).  

- **update_content_search_roles_trg**  
  - Table: `music.roles`  
  - Calls function: `users.update_content_search_roles_trigger`  
  - Syncs `content_search_roles` after role changes.  

- **refresh_profile_content_search_details_trg**  
  - Table: `social.profile_hashtags`  
  - Calls function: `social.refresh_profile_content_search_details`  
  - Updates hashtag‑based search vector on insert / delete.  

- **update_content_search_all_trg**  
  - Table: `users.profiles`  
  - Calls function: `users.update_content_search_all`  
  - Aggregates all individual tsvectors into `content_search_all`.  

---

## users.profile_group_members

- **trg_reassign_admin_on_leave**  
  - Table: `users.profile_group_members`  
  - Calls function: `users.reassign_admin_on_leave`  
  - Promotes a new admin automatically when the last one exits the group.  

---

## social.messages

- **soft_delete_message_trg**  
  - Table: `social.messages`  
  - Calls function: `social.soft_delete_message`  
  - Sets `deleted_at` instead of hard‑deleting a message.  

- **update_message_timestamp_trg**  
  - Table: `social.messages`  
  - Calls function: `social.update_message_timestamp`  
  - Refreshes `updated_at` on message edits.  

---

## social.posts  (timestamp tracking)

- **update_post_timestamp_trg**  
  - Table: `social.posts`  
  - Calls function: `social.update_post_timestamp`  
  - Maintains `updated_at` on post updates.  

---

## social.post_comments  (timestamp tracking)

- **update_comment_timestamp_trg**  
  - Table: `social.post_comments`  
  - Calls function: `social.update_comment_timestamp`  
  - Maintains `updated_at` on comment edits.  

---

## social.user_connections  (timestamp tracking)

- **update_connection_timestamp_trg**  
  - Table: `social.user_connections`  
  - Calls function: `social.update_connection_timestamp`  
  - Maintains `updated_at` on connection status changes.  

---

## groups.event_rsvps

- **update_rsvp_timestamp_trg**  
  - Table: `groups.event_rsvps`  
  - Calls function: `groups.update_rsvp_timestamp`  
  - Touches `updated_at` whenever an RSVP row is modified.  

---

## users.ui_preferences / users.privacy_settings — Timestamp “touch”

- **trg_touch_ui_prefs**  
  - Table: `users.ui_preferences`  
  - Calls function: `users.touch_ui_prefs`  
  - Updates `updated_at` each time UI preferences are modified.  

- **trg_touch_privacy**  
  - Table: `users.privacy_settings`  
  - Calls function: `users.touch_privacy`  
  - Updates `updated_at` whenever privacy preferences are changed.  

---

## social.musician_ads

- **trg_tsv_musician_ads**  
  - Table: `social.musician_ads`  
  - Calls function: `social.musician_ads_tsv_update`  
  - Rebuilds the ad’s full‑text search vector on insert or update.  
