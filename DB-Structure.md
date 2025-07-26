users
│
├── privacy_settings
│   ├─ profile_id (UUID, NOT NULL)
│   ├─ prefs (jsonb, NOT NULL, default: '{}')
│   ├─ created_at (timestamp with time zone, nullable, default: now())
│   └─ updated_at (timestamp with time zone, nullable, default: now())
│   └─ Triggers:
│       └─ trg_touch_privacy → users.touch_privacy()
│
├── profile_group_members
│   ├─ profile_group_id (UUID, NOT NULL)
│   ├─ profile_id (UUID, NOT NULL)
│   ├─ role (text, nullable, default: 'member')
│   ├─ joined_at (timestamp without time zone, nullable, default: now())
│   ├─ id (UUID, NOT NULL, default: gen_random_uuid())
│   └─ roles_in_group (text[], nullable, default: '{}')
│   └─ Triggers:
│       ├─ trg_reassign_admin_on_leave → users.reassign_admin_on_leave()
│       ├─ trigger_group_member_join → users.notify_profile_group_join()
│       └─ trigger_group_member_leave → users.notify_profile_group_leave()
│
├── profile_groups
│   ├─ id (UUID, NOT NULL, default: gen_random_uuid())
│   ├─ name (text, NOT NULL)
│   ├─ avatar_url (text, nullable)
│   ├─ bio (text, nullable)
│   ├─ country (text, nullable)
│   ├─ city (text, nullable)
│   ├─ genres (ARRAY, nullable)
│   ├─ created_by (UUID, nullable)
│   ├─ created_at (timestamp without time zone, nullable, default: now())
│   └─ state (text, nullable)
│   └─ Triggers:
│       └─ after_profile_group_insert → users.add_creator_to_group_members()
│
├── profiles
│   ├─ id (UUID, NOT NULL, default: auth.uid())
│   ├─ created_at (timestamp with time zone, NOT NULL, default: now())
│   ├─ username (text, nullable)
│   ├─ gender (text, nullable)
│   ├─ email (text, NOT NULL)
│   ├─ avatar_url (text, nullable)
│   ├─ country (text, nullable)
│   ├─ firstname (text, nullable)
│   ├─ lastname (text, nullable)
│   ├─ birthdate (timestamp without time zone, nullable)
│   ├─ bio (text, nullable)
│   ├─ content_search (tsvector, nullable)
│   ├─ content_search_roles (tsvector, nullable)
│   ├─ content_search_details (tsvector, nullable)
│   ├─ content_search_all (tsvector, nullable)
│   ├─ last_seen (timestamp with time zone, nullable)
│   ├─ state (text, nullable)
│   └─ neighborhood (text, nullable)
│   └─ Triggers:
│       ├─ trg_update_content_search_all → users.update_content_search_all()
│       ├─ trigger_prevent_duplicate_usernames → users.prevent_duplicate_usernames()
│       └─ trigger_update_profile_content_search → users.update_profile_content_search()
│
└── ui_preferences
    ├─ profile_id (UUID, NOT NULL)
    ├─ lang (text, NOT NULL, default: 'en')
    ├─ theme (text, NOT NULL, default: 'dark')
    ├─ time_format (text, NOT NULL, default: '24h')
    ├─ created_at (timestamp with time zone, nullable, default: now())
    └─ updated_at (timestamp with time zone, nullable, default: now())
    └─ Triggers:
        └─ trg_touch_ui_prefs → users.touch_ui_prefs()

music
│
├── composer_details
│   ├─ id (UUID, NOT NULL, default: gen_random_uuid())
│   ├─ created_at (timestamp with time zone, NOT NULL, default: now())
│   ├─ role_id (UUID, nullable)
│   ├─ composition_style (text, nullable)
│   ├─ years_of_experience (smallint, nullable)
│   └─ level (text, nullable)
│   └─ profile_id (UUID, nullable)
│
├── dj_details
│   ├─ id (UUID, NOT NULL, default: gen_random_uuid())
│   ├─ created_at (timestamp with time zone, NOT NULL, default: now())
│   ├─ role_id (UUID, nullable)
│   ├─ preferred_genres (text, nullable)
│   ├─ events_played (text, nullable)
│   ├─ profile_id (UUID, nullable)
│   └─ level (text, nullable)
│
├── instrument_details
│   ├─ id (UUID, NOT NULL, default: gen_random_uuid())
│   ├─ created_at (timestamp with time zone, NOT NULL, default: now())
│   ├─ profile_id (UUID, NOT NULL)
│   ├─ instrument (text, NOT NULL)
│   ├─ years_of_experience (smallint, nullable)
│   ├─ level (text, nullable)
│   └─ role_id (UUID, nullable)
│
├── producer_details
│   ├─ id (UUID, NOT NULL, default: gen_random_uuid())
│   ├─ created_at (timestamp with time zone, NOT NULL, default: now())
│   ├─ role_id (UUID, nullable)
│   ├─ production_type (text, nullable)
│   ├─ years_of_experience (smallint, nullable)
│   ├─ level (text, nullable)
│   └─ profile_id (UUID, nullable)
│
├── roles
│   ├─ id (UUID, NOT NULL, default: gen_random_uuid())
│   ├─ created_at (timestamp with time zone, NOT NULL, default: now())
│   ├─ role (text, NOT NULL)
│   └─ profile_id (UUID, nullable)
│   └─ Triggers:
│       └─ trg_update_content_search_roles → music.update_content_search_roles_trigger()
│
├── singer_details
│   ├─ id (UUID, NOT NULL, default: gen_random_uuid())
│   ├─ created_at (timestamp with time zone, NOT NULL, default: now())
│   ├─ role_id (UUID, nullable)
│   ├─ voice_type (text, nullable)
│   ├─ music_genre (text, nullable)
│   ├─ level (text, nullable)
│   └─ profile_id (UUID, nullable)
│
└── user_media_links
    ├─ id (UUID, NOT NULL, default: gen_random_uuid())
    ├─ created_at (timestamp with time zone, NOT NULL, default: now())
    ├─ profile_id (UUID, nullable)
    ├─ url (text, nullable)
    ├─ profile_group_id (UUID, nullable)
    ├─ media_type (text, nullable)
    ├─ title (text, nullable)
    └─ description (text, nullable)

social
│
├── comments
│   ├─ id (UUID, NOT NULL, default: gen_random_uuid())
│   ├─ created_at (timestamp with time zone, NOT NULL, default: now())
│   ├─ post_id (UUID, nullable)
│   ├─ profile_id (UUID, nullable)
│   ├─ content (text, NOT NULL)
│   ├─ updated_at (timestamp without time zone, nullable)
│   └─ parent_id (UUID, nullable)
│   └─ Triggers:
│       ├─ trigger_comment → notify_comment()
│       └─ trigger_update_comment_timestamp → update_comment_timestamp()
│
├── conversation_participants
│   ├─ conversation_id (UUID, NOT NULL)
│   ├─ profile_id (UUID, NOT NULL)
│   ├─ joined_at (timestamp with time zone, NOT NULL, default: now())
│   └─ role (text, NOT NULL, default: 'member')
│   └─ Trigger:
│       └─ trigger_prevent_duplicate_participants → prevent_duplicate_participants()
│
├── conversations
│   ├─ id (UUID, NOT NULL, default: gen_random_uuid())
│   ├─ created_at (timestamp with time zone, NOT NULL, default: now())
│   ├─ updated_at (timestamp with time zone, nullable)
│   ├─ avatar_url (text, nullable)
│   ├─ title (text, nullable)
│   ├─ is_group (boolean, nullable, default: false)
│   └─ created_by (UUID, nullable)
│   └─ Triggers:
│       ├─ trg_set_creator_as_admin → set_creator_as_admin()
│       └─ trigger_delete_messages_on_conversation_delete → delete_messages_on_conversation_delete()
│
├── hashtags
│   ├─ id (UUID, NOT NULL, default: gen_random_uuid())
│   ├─ name (text, NOT NULL)
│   └─ created_at (timestamp with time zone, nullable, default: now())
│
├── likes
│   ├─ id (UUID, NOT NULL, default: gen_random_uuid())
│   ├─ created_at (timestamp with time zone, NOT NULL, default: now())
│   ├─ profile_id (UUID, nullable)
│   ├─ post_id (UUID, nullable)
│   └─ comment_id (UUID, nullable)
│   └─ Triggers:
│       ├─ trigger_like → notify_like()
│       └─ trigger_prevent_duplicate_likes → prevent_duplicate_likes()
│
├── message_attachments
│   ├─ id (UUID, NOT NULL, default: gen_random_uuid())
│   ├─ created_at (timestamp with time zone, NOT NULL, default: now())
│   ├─ message_id (UUID, nullable)
│   ├─ url (text, NOT NULL)
│   └─ mime_type (text, nullable)
│
├── messages
│   ├─ id (UUID, NOT NULL, default: gen_random_uuid())
│   ├─ created_at (timestamp with time zone, NOT NULL, default: now())
│   ├─ conversation_id (UUID, NOT NULL)
│   ├─ sender_profile_id (UUID, NOT NULL)
│   ├─ content (text, NOT NULL)
│   ├─ updated_at (timestamp with time zone, nullable)
│   ├─ deleted_at (timestamp with time zone, nullable)
│   ├─ delivered_to (ARRAY[UUID], NOT NULL, default: ARRAY[]::uuid[])
│   └─ read_by (ARRAY[UUID], NOT NULL, default: ARRAY[]::uuid[])
│   └─ Triggers:
│       ├─ trigger_soft_delete_message → soft_delete_message()
│       └─ trigger_update_message_timestamp → update_message_timestamp()
│
├── musician_ads
│   ├─ id (UUID, NOT NULL, default: gen_random_uuid())
│   ├─ profile_id (UUID, nullable)
│   ├─ group_id (UUID, nullable)
│   ├─ ad_type (text, NOT NULL)
│   ├─ looking_for (ARRAY, nullable)
│   ├─ genres (ARRAY, nullable)
│   ├─ location (text, nullable)
│   ├─ description (text, NOT NULL)
│   ├─ created_at (timestamp without time zone, nullable, default: now())
│   ├─ creator_type (text, nullable)
│   ├─ title (text, NOT NULL, default: '')
│   └─ content_search (tsvector, nullable)
│
├── notification_prefs
│   ├─ profile_id (UUID, NOT NULL)
│   ├─ likes (boolean, nullable, default: true)
│   ├─ comments (boolean, nullable, default: true)
│   ├─ connections (boolean, nullable, default: true)
│   ├─ groups (boolean, nullable, default: true)
│   └─ matches (boolean, nullable, default: true)
│
├── notifications
│   ├─ id (UUID, NOT NULL, default: gen_random_uuid())
│   ├─ created_at (timestamp with time zone, NOT NULL, default: now())
│   ├─ profile_id (UUID, nullable)
│   ├─ type (text, nullable)
│   ├─ entity_id (UUID, nullable)
│   ├─ from_user_id (UUID, nullable)
│   ├─ is_read (boolean, nullable)
│   ├─ message (text, nullable)
│   └─ payload (jsonb, NOT NULL, default: '{}')
│
├── post_hashtags
│   ├─ post_id (UUID, NOT NULL)
│   ├─ hashtag_id (UUID, NOT NULL)
│   └─ created_at (timestamp with time zone, nullable, default: now())
│   └─ Trigger:
│       └─ update_content_search_hashtags → refresh_post_content_search()
│
├── posts
│   ├─ id (UUID, NOT NULL, default: gen_random_uuid())
│   ├─ created_at (timestamp with time zone, NOT NULL, default: now())
│   ├─ profile_id (UUID, nullable)
│   ├─ content (text, NOT NULL)
│   ├─ images_urls (ARRAY, nullable)
│   ├─ updated_at (timestamp without time zone, nullable)
│   ├─ title (text, NOT NULL)
│   ├─ content_search (tsvector, nullable)
│   ├─ group_id (UUID, nullable)
│   └─ Triggers:
│       ├─ trigger_update_post_timestamp → update_post_timestamp()
│       └─ update_content_search_trigger → refresh_post_content_search()
│
├── profile_hashtags
│   ├─ profile_id (UUID, NOT NULL)
│   ├─ hashtag_id (UUID, NOT NULL)
│   ├─ created_at (timestamp with time zone, nullable, default: now())
│   └─ Trigger:
│       └─ trg_refresh_profile_search → refresh_profile_content_search_details()
│
└── user_connections
    ├─ id (UUID, NOT NULL, default: gen_random_uuid())
    ├─ created_at (timestamp with time zone, NOT NULL, default: now())
    ├─ follower_profile_id (UUID, nullable)
    ├─ following_profile_id (UUID, nullable)
    ├─ status (USER-DEFINED, NOT NULL)
    ├─ updated_at (timestamp without time zone, nullable)
    └─ Triggers:
        ├─ trigger_follow_request → notify_follow_request()
        └─ trigger_update_connection_timestamp → update_connection_timestamp()


groups
│
├── event_rsvps
│   ├─ event_id (UUID, NOT NULL)
│   ├─ profile_id (UUID, NOT NULL)
│   ├─ status (text, nullable, default: 'pending')
│   ├─ updated_at (timestamp with time zone, nullable, default: CURRENT_TIMESTAMP)
│   └─ Trigger:
│       └─ update_rsvp_timestamp_trg → update_rsvp_timestamp()
│
├── group_events
│   ├─ id (UUID, NOT NULL, default: gen_random_uuid())
│   ├─ profile_group_id (UUID, NOT NULL)
│   ├─ title (text, NOT NULL)
│   ├─ description (text, nullable)
│   ├─ location (text, nullable)
│   ├─ type (text, NOT NULL)
│   ├─ start_time (timestamp with time zone, NOT NULL)
│   ├─ end_time (timestamp with time zone, NOT NULL)
│   ├─ created_by (UUID, NOT NULL)
│   ├─ created_at (timestamp with time zone, nullable, default: CURRENT_TIMESTAMP)
│
├── profile_group_followers_expanded
│   ├─ follow_id (UUID, nullable)
│   ├─ profile_group_id (UUID, nullable)
│   ├─ follower_profile_id (UUID, nullable)
│   ├─ created_at (timestamp with time zone, nullable)
│   ├─ profile_id (UUID, nullable)
│   ├─ username (text, nullable)
│   ├─ avatar_url (text, nullable)
│   ├─ state (text, nullable)
│   └─ country (text, nullable)
│
└── profile_group_follows
    ├─ id (UUID, NOT NULL, default: gen_random_uuid())
    ├─ follower_profile_id (UUID, NOT NULL)
    ├─ profile_group_id (UUID, NOT NULL)
    ├─ created_at (timestamp with time zone, NOT NULL, default: now())
    └─ Trigger:
        └─ trg_pg_follow_notif → notify_profile_group_follow()


storage
│
├── buckets
│   ├─ id (text, NOT NULL)
│   ├─ name (text, NOT NULL)
│   ├─ owner (uuid, nullable)
│   ├─ created_at (timestamp with time zone, nullable, default: now())
│   ├─ updated_at (timestamp with time zone, nullable, default: now())
│   ├─ public (boolean, nullable, default: false)
│   ├─ avif_autodetection (boolean, nullable, default: false)
│   ├─ file_size_limit (bigint, nullable)
│   ├─ allowed_mime_types (ARRAY, nullable)
│   ├─ owner_id (text, nullable)
│
├── migrations
│   ├─ id (integer, NOT NULL)
│   ├─ name (character varying, NOT NULL)
│   ├─ hash (character varying, NOT NULL)
│   ├─ executed_at (timestamp without time zone, nullable, default: CURRENT_TIMESTAMP)
│
├── objects
│   ├─ id (uuid, NOT NULL, default: gen_random_uuid())
│   ├─ bucket_id (text, nullable)
│   ├─ name (text, nullable)
│   ├─ owner (uuid, nullable)
│   ├─ created_at (timestamp with time zone, nullable, default: now())
│   ├─ updated_at (timestamp with time zone, nullable, default: now())
│   ├─ last_accessed_at (timestamp with time zone, nullable, default: now())
│   ├─ metadata (jsonb, nullable)
│   ├─ path_tokens (ARRAY, nullable)
│   ├─ version (text, nullable)
│   ├─ owner_id (text, nullable)
│   ├─ user_metadata (jsonb, nullable)
│   └─ Trigger:
│       └─ update_objects_updated_at → update_updated_at_column()
│
├── s3_multipart_uploads
│   ├─ id (text, NOT NULL)
│   ├─ in_progress_size (bigint, NOT NULL, default: 0)
│   ├─ upload_signature (text, NOT NULL)
│   ├─ bucket_id (text, NOT NULL)
│   ├─ key (text, NOT NULL)
│   ├─ version (text, NOT NULL)
│   ├─ owner_id (text, nullable)
│   ├─ created_at (timestamp with time zone, NOT NULL, default: now())
│   ├─ user_metadata (jsonb, nullable)
│
└── s3_multipart_uploads_parts
    ├─ id (uuid, NOT NULL, default: gen_random_uuid())
    ├─ upload_id (text, NOT NULL)
    ├─ size (bigint, NOT NULL, default: 0)
    ├─ part_number (integer, NOT NULL)
    ├─ bucket_id (text, NOT NULL)
    ├─ key (text, NOT NULL)
    ├─ etag (text, NOT NULL)
    ├─ owner_id (text, nullable)
    ├─ version (text, NOT NULL)
    ├─ created_at (timestamp with time zone, NOT NULL, default: now())
