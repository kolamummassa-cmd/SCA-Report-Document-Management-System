-- Full-text search triggers
-- Keeps reports.searchVector / documents.searchVector up to date
-- automatically on insert/update, weighting title highest.
-- (Hand-written: Prisma's schema/migration engine has no concept of
-- triggers or functions, so this can't be generated from schema.prisma.)

CREATE FUNCTION reports_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW."searchVector" :=
    setweight(to_tsvector('english', coalesce(NEW."title", '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW."reportNumber", '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW."executiveSummary", '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW."objectives", '')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW."achievements", '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reports_search_vector_trigger
BEFORE INSERT OR UPDATE ON "reports"
FOR EACH ROW EXECUTE FUNCTION reports_search_vector_update();

CREATE FUNCTION documents_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW."searchVector" :=
    setweight(to_tsvector('english', coalesce(NEW."title", '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW."documentType", '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW."description", '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER documents_search_vector_trigger
BEFORE INSERT OR UPDATE ON "documents"
FOR EACH ROW EXECUTE FUNCTION documents_search_vector_update();
