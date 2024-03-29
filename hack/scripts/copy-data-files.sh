#!/bin/bash

# Copyright AppsCode Inc. and Contributors
#
# Licensed under the AppsCode Free Trial License 1.0.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://github.com/appscode/licenses/raw/1.0.0/AppsCode-Free-Trial-1.0.0.md
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

set -eou pipefail

for name in \
    kubedbcom-elasticsearch-editor-options \
    kubedbcom-kafka-editor-options \
    kubedbcom-mariadb-editor-options \
    kubedbcom-memcached-editor-options \
    kubedbcom-mongodb-editor-options \
    kubedbcom-mysql-editor-options \
    kubedbcom-pgbouncer-editor-options \
    kubedbcom-postgres-editor-options \
    kubedbcom-proxysql-editor-options \
    kubedbcom-redis-editor-options \
    kubevaultcom-vaultserver-editor-options \
    opskubedbcom-elasticsearchopsrequest-editor \
    opskubedbcom-etcdopsrequest-editor \
    opskubedbcom-kafkaopsrequest-editor \
    opskubedbcom-mariadbopsrequest-editor \
    opskubedbcom-memcachedopsrequest-editor \
    opskubedbcom-mongodbopsrequest-editor \
    opskubedbcom-mysqlopsrequest-editor \
    opskubedbcom-perconaxtradbopsrequest-editor \
    opskubedbcom-pgbounceropsrequest-editor \
    opskubedbcom-postgresopsrequest-editor \
    opskubedbcom-proxysqlopsrequest-editor \
    opskubedbcom-redisopsrequest-editor \
    opskubedbcom-redissentinelopsrequest-editor \
    opskubevaultcom-vaultopsrequest-editor; do
    mkdir -p charts/$name/data
    cp data/* charts/$name/data
done
