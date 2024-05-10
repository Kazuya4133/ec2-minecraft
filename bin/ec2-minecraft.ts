#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Ec2MinecraftStack } from '../lib/ec2-minecraft-stack';
import * as dotenv from 'dotenv';

dotenv.config();

const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION;

const app = new cdk.App();
new Ec2MinecraftStack(app, 'Ec2MinecraftStack', {
  env: {
    account: account,
    region: region
  }
});