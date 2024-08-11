create table "public"."mood_rating_entries" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "rating" integer not null,
    "date" date not null
);


CREATE UNIQUE INDEX unique_user_date ON public.mood_rating_entries USING btree (user_id, date);

alter table "public"."mood_rating_entries" add constraint "mood_rating_entries_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."mood_rating_entries" validate constraint "mood_rating_entries_user_id_fkey";

alter table "public"."mood_rating_entries" add constraint "unique_user_date" UNIQUE using index "unique_user_date";

grant delete on table "public"."mood_rating_entries" to "anon";

grant insert on table "public"."mood_rating_entries" to "anon";

grant references on table "public"."mood_rating_entries" to "anon";

grant select on table "public"."mood_rating_entries" to "anon";

grant trigger on table "public"."mood_rating_entries" to "anon";

grant truncate on table "public"."mood_rating_entries" to "anon";

grant update on table "public"."mood_rating_entries" to "anon";

grant delete on table "public"."mood_rating_entries" to "authenticated";

grant insert on table "public"."mood_rating_entries" to "authenticated";

grant references on table "public"."mood_rating_entries" to "authenticated";

grant select on table "public"."mood_rating_entries" to "authenticated";

grant trigger on table "public"."mood_rating_entries" to "authenticated";

grant truncate on table "public"."mood_rating_entries" to "authenticated";

grant update on table "public"."mood_rating_entries" to "authenticated";

grant delete on table "public"."mood_rating_entries" to "service_role";

grant insert on table "public"."mood_rating_entries" to "service_role";

grant references on table "public"."mood_rating_entries" to "service_role";

grant select on table "public"."mood_rating_entries" to "service_role";

grant trigger on table "public"."mood_rating_entries" to "service_role";

grant truncate on table "public"."mood_rating_entries" to "service_role";

grant update on table "public"."mood_rating_entries" to "service_role";

create policy "Users can delete their mood rating entries"
on "public"."mood_rating_entries"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Users can insert their mood rating entries"
on "public"."mood_rating_entries"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "Users can update their mood rating entries"
on "public"."mood_rating_entries"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = user_id));



