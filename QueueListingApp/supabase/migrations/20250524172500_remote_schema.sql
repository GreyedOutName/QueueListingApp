

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."decrement_column"("target_queue_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$begin
  update waiting
  set queue_num = queue_num - 1
  where queue_id = target_queue_id;
  
  delete from waiting
  where queue_id = target_queue_id
    and queue_num <= 0;
end;$$;


ALTER FUNCTION "public"."decrement_column"("target_queue_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_max_int8_value"("target_queue_id" "uuid") RETURNS bigint
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  max_value bigint;
BEGIN
  SELECT COALESCE(MAX(queue_num),0)+1 INTO max_value
  FROM waiting
  WHERE queue_id = target_queue_id;

  RETURN max_value;
END;
$$;


ALTER FUNCTION "public"."get_max_int8_value"("target_queue_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_email"("uid" "uuid") RETURNS TABLE("email" "text")
    LANGUAGE "sql"
    AS $$
  select email from auth.users where id = uid;
$$;


ALTER FUNCTION "public"."get_user_email"("uid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."hellow"() RETURNS "text"
    LANGUAGE "sql"
    AS $$
   select 'hello world';
$$;


ALTER FUNCTION "public"."hellow"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."alerts" (
    "queue_id" "uuid" NOT NULL,
    "text" "text" NOT NULL,
    "time_created" timestamp with time zone
);


ALTER TABLE "public"."alerts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."people" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "username" "text" NOT NULL,
    "image_uri" "text",
    "expo_push_token" "text"
);


ALTER TABLE "public"."people" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."queues" (
    "owner_id" "uuid" NOT NULL,
    "queue_id" "uuid" NOT NULL,
    "queue_name" "text",
    "image_uri" "text"
);


ALTER TABLE "public"."queues" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."waiting" (
    "queue_id" "uuid" NOT NULL,
    "queue_num" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "time_joined" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."waiting" OWNER TO "postgres";


ALTER TABLE ONLY "public"."alerts"
    ADD CONSTRAINT "alerts_pkey" PRIMARY KEY ("queue_id");



ALTER TABLE ONLY "public"."people"
    ADD CONSTRAINT "people_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."people"
    ADD CONSTRAINT "people_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."people"
    ADD CONSTRAINT "people_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."queues"
    ADD CONSTRAINT "queues_pkey" PRIMARY KEY ("owner_id");



ALTER TABLE ONLY "public"."waiting"
    ADD CONSTRAINT "waiting_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."people"
    ADD CONSTRAINT "fk_people_user" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."people"
    ADD CONSTRAINT "user" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



CREATE POLICY "Allow All" ON "public"."people" TO "authenticated", "anon" USING (true);



CREATE POLICY "Allow authenticated insert into people" ON "public"."people" FOR INSERT TO "authenticated", "anon" WITH CHECK ((("auth"."uid"() IS NOT NULL) AND ("user_id" = "auth"."uid"())));



CREATE POLICY "Allow insert for authenticated users" ON "public"."queues" FOR INSERT TO "authenticated", "anon" WITH CHECK (("auth"."uid"() = "owner_id"));



CREATE POLICY "Allow read for login" ON "public"."people" FOR SELECT USING (true);



CREATE POLICY "Grant ALL" ON "public"."alerts" TO "authenticated" USING (true);



CREATE POLICY "Grant ALL" ON "public"."waiting" TO "authenticated" USING (true);



CREATE POLICY "Select" ON "public"."queues" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."alerts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."people" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."queues" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."waiting" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."queues";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";











































































































































































GRANT ALL ON FUNCTION "public"."decrement_column"("target_queue_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."decrement_column"("target_queue_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrement_column"("target_queue_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_max_int8_value"("target_queue_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_max_int8_value"("target_queue_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_max_int8_value"("target_queue_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_email"("uid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_email"("uid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_email"("uid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."hellow"() TO "anon";
GRANT ALL ON FUNCTION "public"."hellow"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."hellow"() TO "service_role";


















GRANT ALL ON TABLE "public"."alerts" TO "anon";
GRANT ALL ON TABLE "public"."alerts" TO "authenticated";
GRANT ALL ON TABLE "public"."alerts" TO "service_role";



GRANT ALL ON TABLE "public"."people" TO "anon";
GRANT ALL ON TABLE "public"."people" TO "authenticated";
GRANT ALL ON TABLE "public"."people" TO "service_role";



GRANT ALL ON TABLE "public"."queues" TO "anon";
GRANT ALL ON TABLE "public"."queues" TO "authenticated";
GRANT ALL ON TABLE "public"."queues" TO "service_role";



GRANT ALL ON TABLE "public"."waiting" TO "anon";
GRANT ALL ON TABLE "public"."waiting" TO "authenticated";
GRANT ALL ON TABLE "public"."waiting" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
