module "website" {
  source = "git::https://github.com/chris-arsenault/ahara.git//modules/website?ref=main"

  prefix         = local.prefix
  hostname       = local.frontend_hostname
  site_directory = "${path.module}/../../frontend/dist"
}

