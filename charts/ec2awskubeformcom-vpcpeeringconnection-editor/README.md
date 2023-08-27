# VPCPeeringConnection Editor

[VPCPeeringConnection Editor by AppsCode](https://byte.builders) - VPCPeeringConnection Editor

## TL;DR;

```bash
$ helm repo add bytebuilders-ui https://bundles.byte.builders/ui/
$ helm repo update
$ helm search repo bytebuilders-ui/ec2awskubeformcom-vpcpeeringconnection-editor --version=v0.4.16
$ helm upgrade -i ec2awskubeformcom-vpcpeeringconnection-editor bytebuilders-ui/ec2awskubeformcom-vpcpeeringconnection-editor -n default --create-namespace --version=v0.4.16
```

## Introduction

This chart deploys a VPCPeeringConnection Editor on a [Kubernetes](http://kubernetes.io) cluster using the [Helm](https://helm.sh) package manager.

## Prerequisites

- Kubernetes 1.16+

## Installing the Chart

To install/upgrade the chart with the release name `ec2awskubeformcom-vpcpeeringconnection-editor`:

```bash
$ helm upgrade -i ec2awskubeformcom-vpcpeeringconnection-editor bytebuilders-ui/ec2awskubeformcom-vpcpeeringconnection-editor -n default --create-namespace --version=v0.4.16
```

The command deploys a VPCPeeringConnection Editor on the Kubernetes cluster in the default configuration. The [configuration](#configuration) section lists the parameters that can be configured during installation.

> **Tip**: List all releases using `helm list`

## Uninstalling the Chart

To uninstall the `ec2awskubeformcom-vpcpeeringconnection-editor`:

```bash
$ helm uninstall ec2awskubeformcom-vpcpeeringconnection-editor -n default
```

The command removes all the Kubernetes components associated with the chart and deletes the release.

## Configuration

The following table lists the configurable parameters of the `ec2awskubeformcom-vpcpeeringconnection-editor` chart and their default values.

|     Parameter      | Description |                  Default                   |
|--------------------|-------------|--------------------------------------------|
| apiVersion         |             | <code>ec2.aws.kubeform.com/v1alpha1</code> |
| kind               |             | <code>VPCPeeringConnection</code>          |
| metadata.name      |             | <code>vpcpeeringconnection</code>          |
| metadata.namespace |             | <code>""</code>                            |


Specify each parameter using the `--set key=value[,key=value]` argument to `helm upgrade -i`. For example:

```bash
$ helm upgrade -i ec2awskubeformcom-vpcpeeringconnection-editor bytebuilders-ui/ec2awskubeformcom-vpcpeeringconnection-editor -n default --create-namespace --version=v0.4.16 --set apiVersion=ec2.aws.kubeform.com/v1alpha1
```

Alternatively, a YAML file that specifies the values for the parameters can be provided while
installing the chart. For example:

```bash
$ helm upgrade -i ec2awskubeformcom-vpcpeeringconnection-editor bytebuilders-ui/ec2awskubeformcom-vpcpeeringconnection-editor -n default --create-namespace --version=v0.4.16 --values values.yaml
```