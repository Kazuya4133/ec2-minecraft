import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as fs from 'fs';

export class Ec2MinecraftStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // デフォルトVPCの取得
    const vpc = ec2.Vpc.fromLookup(this, 'VPC', {
      isDefault: true,
    });

    // セキュリティグループの作成
    const securityGroup = new ec2.SecurityGroup(this, 'SecurityGroup', {
      vpc,
      securityGroupName: 'Minecraft Security Group',
      description: 'Security group with ports open for Minecraft Server & SSH.',
      allowAllOutbound: true
    });

    // SSHとカスタムポートのルールを追加（東京リージョンを想定）
    securityGroup.addIngressRule(ec2.Peer.ipv4('3.112.23.0/29'), ec2.Port.tcp(22), 'ap-northeast-1 EC2 Instance Connect');
    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(25565), 'Allow Minecraft connections');

    // キーペアの作成
    const keyPair = new ec2.KeyPair(this, 'KeyPair', {
      keyPairName: 'MinecraftKey',
      type: ec2.KeyPairType.RSA
    })

    // ユーザデータファイルの読み込み
    const userDataScript = fs.readFileSync('./lib/userdata.sh', 'utf8');

    // EC2インスタンスを作成
    const instance = new ec2.Instance(this, 'Instance', {
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC
      },
      instanceType: new ec2.InstanceType('t4g.small'),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2023,
        cpuType: ec2.AmazonLinuxCpuType.ARM_64
      }),
      securityGroup: securityGroup,
      keyPair: keyPair,
      userData: ec2.UserData.custom(userDataScript),
    });

    // EIPをインスタンスに割り当て
    const eip = new ec2.CfnEIP(this, 'EIP', {
      instanceId: instance.instanceId,
    });
  }
}