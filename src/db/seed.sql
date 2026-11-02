-- Seed data for CertFolio local development & demonstration
-- Inserts a demo user 'alyssa' and sample certificates

INSERT OR IGNORE INTO users (id, email, username, display_name, bio, accent_color, theme, layout, created_at, updated_at)
VALUES (
  'user_demo_alyssa_001',
  'alyssa@example.com',
  'alyssa',
  'Alyssa Mae',
  'Senior Cloud & Full Stack Engineer passionate about distributed systems, edge architectures, and high-performance web applications.',
  '#2563eb',
  'system',
  'grid',
  1704067200,
  1704067200
);

INSERT OR IGNORE INTO certificates (id, user_id, title, issuer, issued_at, category, description, file_key, file_type, file_name, file_size, verify_url, sort_order, is_public, created_at, updated_at)
VALUES
(
  'cert_demo_001',
  'user_demo_alyssa_001',
  'AWS Certified Solutions Architect - Professional',
  'Amazon Web Services',
  '2024-03',
  'Cloud Architecture',
  'Demonstrated advanced technical skills and experience designing distributed applications and systems on the AWS platform.',
  'certs/user_demo_alyssa_001/aws-sap.png',
  'image/png',
  'aws-solutions-architect.png',
  245000,
  'https://www.credly.com/org/amazon-web-services',
  0,
  1,
  1709251200,
  1709251200
),
(
  'cert_demo_002',
  'user_demo_alyssa_001',
  'Google Cloud Professional Cloud Security Engineer',
  'Google Cloud',
  '2024-01',
  'Security',
  'Proficiency in designing and managing secure workloads, configuring identity and access management, and organizational security policies.',
  'certs/user_demo_alyssa_001/gcp-sec.png',
  'image/png',
  'gcp-security-engineer.png',
  198000,
  'https://cloud.google.com/certification',
  1,
  1,
  1704067200,
  1704067200
),
(
  'cert_demo_003',
  'user_demo_alyssa_001',
  'Certified Kubernetes Administrator (CKA)',
  'Cloud Native Computing Foundation',
  '2023-11',
  'DevOps',
  'Hands-on expertise in Kubernetes cluster architecture, workload configuration, storage management, troubleshooting, and networking.',
  'certs/user_demo_alyssa_001/cka-cert.pdf',
  'application/pdf',
  'cka-certification.pdf',
  312000,
  'https://www.cncf.io/certification/cka/',
  2,
  1,
  1700000000,
  1700000000
),
(
  'cert_demo_004',
  'user_demo_alyssa_001',
  'HashiCorp Certified: Terraform Associate',
  'HashiCorp',
  '2023-08',
  'Infrastructure as Code',
  'Knowledge of Terraform open-source concepts, modules, state management, CLI workflows, and cloud provisioning best practices.',
  'certs/user_demo_alyssa_001/terraform.png',
  'image/png',
  'terraform-associate.png',
  182000,
  'https://www.hashicorp.com/certification/terraform-associate',
  3,
  1,
  1692000000,
  1692000000
);

INSERT OR IGNORE INTO profile_views (id, user_id, viewed_at)
VALUES 
  ('view_001', 'user_demo_alyssa_001', 1709251200),
  ('view_002', 'user_demo_alyssa_001', 1709255000),
  ('view_003', 'user_demo_alyssa_001', 1709260000);

