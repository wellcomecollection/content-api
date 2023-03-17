data "aws_vpc" "vpc" {
  id = var.vpc_id
}

resource "aws_security_group" "vpc_ingress" {
  name        = "${var.environment}-content-api-vpc-ingress"
  description = "Allow traffic from within the VPC into the service"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [data.aws_vpc.vpc.cidr_block]
  }

  tags = {
    Name = "${var.environment}-vpc-ingress"
  }
}

resource "aws_security_group" "egress" {
  name        = "${var.environment}-content-api-egress"
  description = "Allows all egress traffic from the group"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.environment}-content-api-egress"
  }
}
