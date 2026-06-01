-- Allow JSON files in the cv-pdfs bucket for JSON Resume imports
update storage.buckets
set allowed_mime_types = array['application/pdf', 'application/json']
where id = 'cv-pdfs';

-- Allow json_resume as a valid CV document type
alter table cvs drop constraint cvs_type_check;
alter table cvs add constraint cvs_type_check check (type in ('uploaded', 'template', 'json_resume'));
