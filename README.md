# StockWiz Deployment Guide

This guide details the steps to configure and deploy the StockWiz infrastructure and application using Terraform and GitHub Actions.

## Prerequisites

1.  **AWS Account**: Access to an AWS account (e.g., AWS Academy).
2.  **Terraform**: Installed locally (v1.5+).
3.  **AWS CLI**: Installed and configured with your credentials.
    ```bash
    aws configure
    # Enter your Access Key ID, Secret Access Key, Region (us-east-1), and Output format (json)
    
    # If using AWS Academy (Session Token), add it to ~/.aws/credentials manually or use:
    aws configure set aws_session_token <YOUR_SESSION_TOKEN>
    ```
4.  **GitHub Repository**: This repository.

## 1. Initial Configuration (Bootstrap)

Before running the CI/CD pipelines, you must initialize the backend infrastructure (S3 Bucket for state and DynamoDB for locking).

1.  Navigate to the bootstrap directory:
    ```bash
    cd iac/bootstrap
    ```

2.  Initialize Terraform:
    ```bash
    terraform init
    ```

3.  Apply the configuration:
    ```bash
    terraform apply
    ```
    *   Type `yes` when prompted.
    *   **Note**: This will create an S3 bucket named `alejandrothom-stockwiz-tf-state` and a DynamoDB table `alejandrothom-stockwiz-tf-locks`. If these names are taken, update `iac/bootstrap/variables.tf` and `iac/environments/*/main.tf`.

## 2. Manual Secrets Configuration

The application requires a database password stored in **AWS Secrets Manager**. You can create this via the Console or using the AWS CLI.

### Option A: Using AWS CLI (Recommended)

```bash
aws secretsmanager create-secret \
    --name stockwiz-db-password \
    --description "Database password for StockWiz microservices" \
    --secret-string "{\"password_db_postgre\":\"admin123\"}" \
    --region us-east-1
```

### Option B: Using AWS Console

1.  Go to the **AWS Console** -> **Secrets Manager**.
2.  Click **Store a new secret**.
3.  Choose **Other type of secret**.
4.  Key/Value pairs:
    *   Key: `password_db_postgre`
    *   Value: `admin123` (or your desired password)
5.  Click **Next**.
6.  Secret name: `stockwiz-db-password`
7.  Finish creating the secret.

## 3. GitHub Secrets Configuration

Go to your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions** and add the following secrets:

| Secret Name | Description |
| :--- | :--- |
| `AWS_ACCESS_KEY_ID` | Your AWS Access Key. |
| `AWS_SECRET_ACCESS_KEY` | Your AWS Secret Key. |
| `AWS_SESSION_TOKEN` | Your AWS Session Token (required for temporary credentials like AWS Academy). |
| `SONAR_TOKEN` | Token for SonarCloud analysis. |
| `SONAR_ORGANIZATION` | Your SonarCloud organization key. |
| `SONAR_PROJECT_KEY` | Your SonarCloud project key. |
| `DISCORD_WEBHOOK_URL` | (Optional) Webhook URL for deployment notifications. |
| `LAB_ROLE_ARN` | ARN of the `LabRole` (required for Test/Prod environments). |

## 4. Deployment Pipelines

The deployment is automated via GitHub Actions:

### Dev Environment
*   **Trigger**: Push to `main` branch.
*   **Action**: Builds images, runs SonarCloud scan, and deploys to the Dev environment using Terraform.

### Test Environment
*   **Trigger**: Automatically triggered after a successful Dev deployment.
*   **Action**: Promotes images (retags as `test`), deploys to Test environment, and runs k6 load tests.

### Prod Environment
*   **Trigger**:
    *   **Manual**: Workflow Dispatch (select commit SHA).
    *   **Release**: Publishing a release (tag starting with `v*`).
*   **Action**: Deploys the verified artifacts to Production.

## 5. Monitoring

*   **CloudWatch**: Check the "StockWiz-dev-Dashboard" (and test/prod equivalents) for metrics.
*   **Discord**: If configured, you will receive notifications for deployment status.

## 6. Manual Deployment (Optional)

If you prefer to deploy manually using Terraform (bypassing GitHub Actions), follow these steps. Ensure you have run the **Bootstrap** step first.

### Dev Environment

```bash
cd iac/environments/dev
terraform init
terraform apply -var="discord_webhook_url=<YOUR_WEBHOOK_URL>"
```

### Test Environment

Requires `LabRole` ARN and an existing image tag (e.g., `test-latest` or a specific commit SHA).

```bash
cd iac/environments/test
terraform init
terraform apply \
  -var="lab_role_arn=arn:aws:iam::<YOUR_ACCOUNT_ID>:role/LabRole" \
  -var="image_tag=test-latest" \
  -var="discord_webhook_url=<YOUR_WEBHOOK_URL>"
```

### Prod Environment

Requires `LabRole` ARN and a promoted image tag.

```bash
cd iac/environments/prod
terraform init
terraform apply \
  -var="lab_role_arn=arn:aws:iam::<YOUR_ACCOUNT_ID>:role/LabRole" \
  -var="image_tag=prod-latest" \
  -var="discord_webhook_url=<YOUR_WEBHOOK_URL>"
```
