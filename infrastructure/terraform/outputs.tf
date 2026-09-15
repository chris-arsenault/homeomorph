output "url" {
  description = "Public website URL"
  value       = module.website.url
}

output "bucket_name" {
  description = "Website asset bucket"
  value       = module.website.bucket_name
}

output "distribution_id" {
  description = "CloudFront distribution ID"
  value       = module.website.distribution_id
}
