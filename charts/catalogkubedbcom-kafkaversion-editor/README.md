# KafkaVersion Editor

[KafkaVersion Editor by AppsCode](https://byte.builders) - KafkaVersion Editor

## TL;DR;

```bash
$ helm repo add bytebuilders-ui https://bundles.byte.builders/ui/
$ helm repo update
$ helm search repo bytebuilders-ui/catalogkubedbcom-kafkaversion-editor --version=v0.4.14
$ helm upgrade -i catalogkubedbcom-kafkaversion-editor bytebuilders-ui/catalogkubedbcom-kafkaversion-editor -n default --create-namespace --version=v0.4.14
```

## Introduction

This chart deploys a KafkaVersion Editor on a [Kubernetes](http://kubernetes.io) cluster using the [Helm](https://helm.sh) package manager.

## Prerequisites

- Kubernetes 1.16+

## Installing the Chart

To install/upgrade the chart with the release name `catalogkubedbcom-kafkaversion-editor`:

```bash
$ helm upgrade -i catalogkubedbcom-kafkaversion-editor bytebuilders-ui/catalogkubedbcom-kafkaversion-editor -n default --create-namespace --version=v0.4.14
```

The command deploys a KafkaVersion Editor on the Kubernetes cluster in the default configuration. The [configuration](#configuration) section lists the parameters that can be configured during installation.

> **Tip**: List all releases using `helm list`

## Uninstalling the Chart

To uninstall the `catalogkubedbcom-kafkaversion-editor`:

```bash
$ helm uninstall catalogkubedbcom-kafkaversion-editor -n default
```

The command removes all the Kubernetes components associated with the chart and deletes the release.

## Configuration

The following table lists the configurable parameters of the `catalogkubedbcom-kafkaversion-editor` chart and their default values.

|     Parameter      | Description |                 Default                  |
|--------------------|-------------|------------------------------------------|
| apiVersion         |             | <code>catalog.kubedb.com/v1alpha1</code> |
| kind               |             | <code>KafkaVersion</code>                |
| metadata.name      |             | <code>kafkaversion</code>                |
| metadata.namespace |             | <code>""</code>                          |


Specify each parameter using the `--set key=value[,key=value]` argument to `helm upgrade -i`. For example:

```bash
$ helm upgrade -i catalogkubedbcom-kafkaversion-editor bytebuilders-ui/catalogkubedbcom-kafkaversion-editor -n default --create-namespace --version=v0.4.14 --set apiVersion=catalog.kubedb.com/v1alpha1
```

Alternatively, a YAML file that specifies the values for the parameters can be provided while
installing the chart. For example:

```bash
$ helm upgrade -i catalogkubedbcom-kafkaversion-editor bytebuilders-ui/catalogkubedbcom-kafkaversion-editor -n default --create-namespace --version=v0.4.14 --values values.yaml
```