terraform {
  required_version = ">= 1.12.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  backend "s3" {
    bucket = "ahara-terraform-state"
    key    = "projects/homeomorph.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = local.aws_region

  default_tags {
    tags = {
      Project   = local.project
      ManagedBy = "terraform"
    }
  }
}

