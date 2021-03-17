function isEqualToModelPathValue(
  { model, getValue, watchDependency },
  value,
  modelPath
) {
  const modelPathValue = getValue(model, modelPath);
  watchDependency("model#" + modelPath);
  return modelPathValue === value;
}

function showAuthPasswordField({ model, getValue, watchDependency }) {
  watchDependency("model#/resources");
  const modelPathValue = getValue(model, "/resources");
  return !!(
    modelPathValue &&
    modelPathValue.secret &&
    modelPathValue.secret.metadata &&
    modelPathValue.secret.metadata.name &&
    !this.showAuthSecretField({ model, getValue, watchDependency })
  );
}

function showAuthSecretField({ model, getValue, watchDependency }) {
  watchDependency("model#/resources/kubedbComMongoDB/spec");
  const modelPathValue = getValue(model, "/resources/kubedbComMongoDB/spec");
  return !!(
    modelPathValue &&
    modelPathValue.authSecret &&
    modelPathValue.authSecret.name
  );
}

function showNewSecretCreateField({
  model,
  getValue,
  watchDependency,
  commit,
}) {
  const resp =
    !this.showAuthSecretField({ model, getValue, watchDependency }) &&
    !this.showAuthPasswordField({ model, getValue, watchDependency });
  const secret = getValue(model, "/resources/secretAuth");
  if (resp && !secret) {
    commit("wizard/model$update", {
      path: "/resources/secretAuth",
      value: {
        data: {
          password: "",
        },
      },
      force: true,
    });
  }
  return resp;
}

function showCommonStorageClassAndSizeField({
  discriminator,
  getValue,
  watchDependency,
}) {
  watchDependency("discriminator#/activeDatabaseMode");
  const mode = getValue(discriminator, "/activeDatabaseMode");
  const validType = ["Standalone", "Replicaset"];
  return validType.includes(mode);
}

function setApiGroup() {
  return "cert-manager.io";
}

async function getIssuerRefsName({
  axios,
  storeGet,
  getValue,
  model,
  watchDependency,
}) {
  const owner = storeGet("/user/username");
  const cluster = storeGet("/clusterInfo/name");
  watchDependency(
    "model#/resources/kubedbComMongoDB/spec/tls/issuerRef/apiGroup"
  );
  watchDependency("model#/resources/kubedbComMongoDB/spec/tls/issuerRef/kind");
  watchDependency("model#/metadata/release/namespace");
  const apiGroup = getValue(
    model,
    "/resources/kubedbComMongoDB/spec/tls/issuerRef/apiGroup"
  );
  const kind = getValue(
    model,
    "/resources/kubedbComMongoDB/spec/tls/issuerRef/kind"
  );
  const namespace = getValue(model, "/metadata/release/namespace");

  let url;
  if (kind === "Issuer") {
    url = `/clusters/${owner}/${cluster}/proxy/${apiGroup}/v1/namespaces/${namespace}/issuers`;
  } else if (kind === "ClusterIssuer") {
    url = `/clusters/${owner}/${cluster}/proxy/${apiGroup}/v1/clusterissuers`;
  }

  const resp = await axios.get(url);

  const resources = (resp && resp.data && resp.data.items) || [];

  resources.map((item) => {
    const name = (item.metadata && item.metadata.name) || "";
    item.text = name;
    item.value = name;
    return true;
  });
  return resources;
}

async function hasIssuerRefName({
  axios,
  storeGet,
  getValue,
  model,
  watchDependency,
}) {
  const resp = await this.getIssuerRefsName({
    axios,
    storeGet,
    getValue,
    model,
    watchDependency,
  });

  return !!(resp && resp.length);
}

async function hasNoIssuerRefName({
  axios,
  storeGet,
  getValue,
  model,
  watchDependency,
}) {
  const resp = await this.hasIssuerRefName({
    axios,
    storeGet,
    getValue,
    model,
    watchDependency,
  });

  console.log(resp);

  return !resp;
}

async function getResources({ axios, storeGet }, group, version, resource) {
  const owner = storeGet("/user/username");
  const cluster = storeGet("/clusterInfo/name");

  const resp = await axios.get(
    `/clusters/${owner}/${cluster}/proxy/${group}/${version}/${resource}`,
    {
      params: { filter: { items: { metadata: { name: null } } } },
    }
  );

  const resources = (resp && resp.data && resp.data.items) || [];

  resources.map((item) => {
    const name = (item.metadata && item.metadata.name) || "";
    item.text = name;
    item.value = name;
    return true;
  });
  return resources;
}

async function getMongoDbVersions(
  { axios, storeGet },
  group,
  version,
  resource
) {
  const owner = storeGet("/user/username");
  const cluster = storeGet("/clusterInfo/name");

  const queryParams = {
    filter: {
      items: {
        metadata: { name: null },
        spec: { version: null, deprecated: null },
      },
    },
  };

  const resp = await axios.get(
    `/clusters/${owner}/${cluster}/proxy/${group}/${version}/${resource}`,
    {
      params: queryParams,
    }
  );

  const resources = (resp && resp.data && resp.data.items) || [];

  // keep only non deprecated versions
  const filteredMongoDbVersions = resources.filter(
    (item) => item.spec && !item.spec.deprecated
  );

  filteredMongoDbVersions.map((item) => {
    const name = (item.metadata && item.metadata.name) || "";
    const specVersion = (item.spec && item.spec.version) || "";
    item.text = `${name} (${specVersion})`;
    item.value = name;
    return true;
  });
  return filteredMongoDbVersions;
}

function setDatabaseMode({ model, getValue, watchDependency }) {
  const modelPathValue = getValue(model, "/resources/kubedbComMongoDB/spec");
  watchDependency("model#/resources/kubedbComMongoDB/spec");
  if (modelPathValue.shardTopology) return "Sharded";
  else if (modelPathValue.replicaset) return "Replicaset";
  else return "Standalone";
}

function deleteDatabaseModePath({ discriminator, getValue, commit, model }) {
  const mode = getValue(discriminator, "/activeDatabaseMode");
  const modelSpec = getValue(model, "/resources/kubedbComMongoDB/spec");
  if (mode === "Sharded") {
    commit(
      "wizard/model$delete",
      "/resources/kubedbComMongoDB/spec/replicaset"
    );
    commit("wizard/model$delete", "/resources/kubedbComMongoDB/spec/replicas");

    if (!modelSpec.shardTopology) {
      commit("wizard/model$update", {
        path: "/resources/kubedbComMongoDB/spec/shardTopology",
        value: {
          configServer: {
            storage: {
              resources: {
                requests: {
                  storage: "",
                },
              },
            },
          },
          mongos: {
            replicas: 2,
          },
          shard: {
            shards: 3,
            storage: {
              resources: {
                requests: {
                  storage: "",
                },
              },
            },
          },
        },
        force: true,
      });
    }
  } else if (mode === "Replicaset") {
    commit(
      "wizard/model$delete",
      "/resources/kubedbComMongoDB/spec/shardTopology"
    );

    if (!modelSpec.replicaset) {
      commit("wizard/model$update", {
        path: "/resources/kubedbComMongoDB/spec/replicaset",
        value: { name: "" },
        force: true,
      });
      commit("wizard/model$update", {
        path: "/resources/kubedbComMongoDB/spec/replicas",
        value: 3,
        force: true,
      });
    }
  } else if (mode === "Standalone") {
    commit(
      "wizard/model$delete",
      "/resources/kubedbComMongoDB/spec/shardTopology"
    );

    commit(
      "wizard/model$delete",
      "/resources/kubedbComMongoDB/spec/replicaset"
    );
    commit("wizard/model$delete", "/resources/kubedbComMongoDB/spec/replicas");
  }
}

function showTlsConfigureSection({ watchDependency, discriminator, getValue }) {
  watchDependency("discriminator#/configureTLS");
  const configureStatus = getValue(discriminator, "/configureTLS");
  return configureStatus;
}

function onTlsConfigureChange({ discriminator, getValue, commit }) {
  const configureStatus = getValue(discriminator, "/configureTLS");
  if (configureStatus) {
    commit("wizard/model$update", {
      path: "/resources/kubedbComMongoDB/spec/tls",
      value: { issuerRef: {}, certificates: [] },
      force: true,
    });
  } else {
    commit("wizard/model$delete", "/resources/kubedbComMongoDB/spec/tls");
  }
}

function showMonitoringSection({ watchDependency, discriminator, getValue }) {
  watchDependency("discriminator#/enableMonitoring");
  const configureStatus = getValue(discriminator, "/enableMonitoring");
  return configureStatus;
}

function onEnableMonitoringChange({ discriminator, getValue, commit }) {
  const configureStatus = getValue(discriminator, "/enableMonitoring");
  if (configureStatus) {
    commit("wizard/model$update", {
      path: "/resources/kubedbComMongoDB/spec/monitor",
      value: {},
      force: true,
    });
  } else {
    commit("wizard/model$delete", "/resources/kubedbComMongoDB/spec/monitor");
  }
}

function showCustomizeExporterSection({
  watchDependency,
  discriminator,
  getValue,
}) {
  watchDependency("discriminator#/customizeExporter");
  const configureStatus = getValue(discriminator, "/customizeExporter");
  return configureStatus;
}

function onCustomizeExporterChange({ discriminator, getValue, commit }) {
  const configureStatus = getValue(discriminator, "/customizeExporter");
  if (configureStatus) {
    commit("wizard/model$update", {
      path:
        "/resources/kubedbComMongoDB/spec/monitor/properties/prometheus/properties/exporter",
      value: {},
      force: true,
    });
  } else {
    commit(
      "wizard/model$delete",
      "/resources/kubedbComMongoDB/spec/monitor/properties/prometheus/properties/exporter"
    );
  }
}

function isEqualToDatabaseMode(
  { getValue, watchDependency, discriminator },
  value
) {
  watchDependency("discriminator#/activeDatabaseMode");
  const mode = getValue(discriminator, "/activeDatabaseMode");
  return mode === value;
}

async function getSecrets({
  storeGet,
  axios,
  model,
  getValue,
  watchDependency,
}) {
  const owner = storeGet("/user/username");
  const cluster = storeGet("/clusterInfo/name");
  const namespace = getValue(model, "/metadata/release/namespace");
  watchDependency("model#/metadata/release/namespace");

  const resp = await axios.get(
    `/clusters/${owner}/${cluster}/proxy/core/v1/namespaces/${namespace}/secrets`,
    {
      params: {
        filter: { items: { metadata: { name: null }, type: null } },
      },
    }
  );

  const secrets = (resp && resp.data && resp.data.items) || [];

  const filteredSecrets = secrets.filter((item) => {
    const validType = ["kubernetes.io/service-account-token", "Opaque"];
    return validType.includes(item.type);
  });

  filteredSecrets.map((item) => {
    const name = (item.metadata && item.metadata.name) || "";
    item.text = name;
    item.value = name;
    return true;
  });
  return filteredSecrets;
}

async function hasExistingSecret({
  storeGet,
  axios,
  model,
  getValue,
  watchDependency,
}) {
  const resp = await this.getSecrets({
    storeGet,
    axios,
    model,
    getValue,
    watchDependency,
  });
  return !!(resp && resp.length);
}

async function hasNoExistingSecret({
  storeGet,
  axios,
  model,
  getValue,
  watchDependency,
}) {
  const resp = await this.hasExistingSecret({
    storeGet,
    axios,
    model,
    getValue,
    watchDependency,
  });
  return !resp;
}

/****** Monitoring *********/

function getValueFrom({ itemCtx }) {
  if (itemCtx.valueFrom && itemCtx.valueFrom.configMapKeyRef) {
    return "ConfigMap";
  } else if (itemCtx.valueFrom && itemCtx.valueFrom.secretKeyRef) {
    return "Secret";
  } else {
    return "Input";
  }
}

function getRefName({ itemCtx }) {
  if (itemCtx.valueFrom && itemCtx.valueFrom.configMapKeyRef) {
    return itemCtx.valueFrom.configMapKeyRef.name;
  } else if (itemCtx.valueFrom && itemCtx.valueFrom.secretKeyRef) {
    return itemCtx.valueFrom.secretKeyRef.name;
  } else {
    return "";
  }
}

function getKeyOrValue({ itemCtx }) {
  if (itemCtx.valueFrom && itemCtx.valueFrom.configMapKeyRef) {
    return itemCtx.valueFrom.configMapKeyRef.key;
  } else if (itemCtx.valueFrom && itemCtx.valueFrom.secretKeyRef) {
    return itemCtx.valueFrom.secretKeyRef.key;
  } else {
    return itemCtx.value;
  }
}

function setValueFrom({ rootModel }) {
  if (isConfigMapTypeValueFrom({ rootModel })) {
    return "configMap";
  } else if (isSecretTypeValueFrom({ rootModel })) {
    return "secret";
  } else {
    return "input";
  }
}

function isEqualToValueFromType(
  { discriminator, getValue, watchDependency },
  value
) {
  watchDependency("discriminator#/valueFromType");
  const valueFrom = getValue(discriminator, "/valueFromType");
  return valueFrom === value;
}

function isConfigMapTypeValueFrom({ rootModel }) {
  const valueFrom = rootModel.valueFrom;
  return !!(valueFrom && valueFrom.configMapKeyRef);
}

function isSecretTypeValueFrom({ rootModel }) {
  const valueFrom = rootModel.valueFrom;
  return !!(valueFrom && valueFrom.secretKeyRef);
}

function isInputTypeValueFrom({ rootModel }) {
  return (
    !this.isConfigMapTypeValueFrom({ rootModel }) &&
    !this.isSecretTypeValueFrom({ rootModel })
  );
}

function onValueFromChange({
  rootModel,
  discriminator,
  getValue,
  updateModelValue,
}) {
  const valueFrom = getValue(discriminator, "/valueFromType");
  if (valueFrom === "input") {
    if (isConfigMapTypeValueFrom({ rootModel }))
      updateModelValue("valueFrom/configMapKeyRef", true);
    if (isSecretTypeValueFrom({ rootModel }))
      updateModelValue("valueFrom/secretKeyRef", true);
  } else if (valueFrom === "secret") {
    if (!isSecretTypeValueFrom({ rootModel }))
      updateModelValue("valueFrom/secretKeyRef", false, {});
    if (isConfigMapTypeValueFrom({ rootModel }))
      updateModelValue("valueFrom/configMapKeyRef", true);
  } else if (valueFrom === "configMap") {
    if (!isConfigMapTypeValueFrom({ rootModel }))
      updateModelValue("valueFrom/configMapKeyRef", false, {});
    if (isSecretTypeValueFrom({ rootModel }))
      updateModelValue("valueFrom/secretKeyRef", true);
  }
}

async function showConfigMapSelectField({
  storeGet,
  model,
  getValue,
  watchDependency,
  axios,
}) {
  const resp = await resourceNames(
    { axios, getValue, model, watchDependency, storeGet },
    "core",
    "v1",
    "configmaps"
  );
  return !!(resp && resp.length);
}

async function showConfigMapInputField({
  storeGet,
  model,
  getValue,
  watchDependency,
  axios,
}) {
  return !this.showConfigMapSelectField({
    storeGet,
    model,
    getValue,
    watchDependency,
    axios,
  });
}

function showSecretSelectField({
  storeGet,
  axios,
  model,
  getValue,
  watchDependency,
}) {
  const resp = this.getSecrets({
    storeGet,
    axios,
    model,
    getValue,
    watchDependency,
  });
  return !!resp.length;
}

function showSecretInputField({
  storeGet,
  axios,
  model,
  getValue,
  watchDependency,
}) {
  return !this.showSecretSelectField({
    storeGet,
    axios,
    model,
    getValue,
    watchDependency,
  });
}

async function getSecretKeys({
  storeGet,
  axios,
  model,
  getValue,
  watchDependency,
  rootModel,
}) {
  const owner = storeGet("/user/username");
  const cluster = storeGet("/clusterInfo/name");
  const namespace = getValue(model, "/metadata/release/namespace");
  const secretName =
    (rootModel &&
      rootModel.valueFrom &&
      rootModel.valueFrom.secretKeyRef &&
      rootModel.valueFrom.secretKeyRef.name) ||
    "";
  watchDependency("model#/metadata/release/namespace");

  if (!secretName) return [];

  const resp = await axios.get(
    `/clusters/${owner}/${cluster}/proxy/core/v1/namespaces/${namespace}/secrets/${secretName}`
  );

  const secret = (resp && resp.data && resp.data.data) || {};

  const secretKeys = Object.keys(secret).map((item) => ({
    text: item,
    value: item,
  }));

  return secretKeys;
}

async function hasSecretKeys({
  storeGet,
  axios,
  model,
  getValue,
  watchDependency,
  rootModel,
}) {
  const resp = await this.getSecretKeys({
    storeGet,
    axios,
    model,
    getValue,
    watchDependency,
    rootModel,
  });
  return !!(resp && resp.length);
}

async function hasNoSecretKeys({
  storeGet,
  axios,
  model,
  getValue,
  watchDependency,
  rootModel,
}) {
  const resp = await this.hasSecretKeys({
    storeGet,
    axios,
    model,
    getValue,
    watchDependency,
    rootModel,
  });
  return !resp;
}

async function getConfigMapKeys({
  storeGet,
  axios,
  model,
  getValue,
  watchDependency,
  rootModel,
}) {
  const owner = storeGet("/user/username");
  const cluster = storeGet("/clusterInfo/name");
  const namespace = getValue(model, "/metadata/release/namespace");
  const configMapName =
    (rootModel &&
      rootModel.valueFrom &&
      rootModel.valueFrom.configMapKeyRef &&
      rootModel.valueFrom.configMapKeyRef.name) ||
    "";
  watchDependency("model#/metadata/release/namespace");

  if (!configMapName) return [];

  const resp = await axios.get(
    `/clusters/${owner}/${cluster}/proxy/core/v1/namespaces/${namespace}/configmaps/${configMapName}`
  );

  const configMaps = (resp && resp.data && resp.data.data) || {};

  const configMapKeys = Object.keys(configMaps).map((item) => ({
    text: item,
    value: item,
  }));

  return configMapKeys;
}

async function hasConfigMapKeys({
  storeGet,
  axios,
  model,
  getValue,
  watchDependency,
  rootModel,
}) {
  const resp = await this.getConfigMapKeys({
    storeGet,
    axios,
    model,
    getValue,
    watchDependency,
    rootModel,
  });
  return !!(resp && resp.length);
}

async function hasNoConfigMapKeys({
  storeGet,
  axios,
  model,
  getValue,
  watchDependency,
  rootModel,
}) {
  const resp = await this.hasConfigMapKeys({
    storeGet,
    axios,
    model,
    getValue,
    watchDependency,
    rootModel,
  });
  return !resp;
}

function setValueFromModel({ getValue, model }, path) {
  return getValue(model, path);
}

function isEqualToDiscriminatorPath(
  { discriminator, getValue, watchDependency },
  value,
  discriminatorPath
) {
  watchDependency("discriminator#" + discriminatorPath);
  const discriminatorValue = getValue(discriminator, discriminatorPath);
  return discriminatorValue === value;
}

function setHonorLabels({ rootModel }) {
  return rootModel.honorLabels || false;
}

function onConfigSecretNameChange({ commit, model, getValue }) {
  commit("wizard/model$update", {
    path: "resources/kubedbComMongoDB/spec/configSecret/name",
    value: getValue(model, "resources/secretConfig/metadata/name"),
    force: true,
  });
}

//////////////////////////////////////////////////////////////////////////

const stashAppscodeComRestoreSessionInit = {
  apiVersion: "stash.appscode.com/v1beta1",
  kind: "RestoreSession",
  metadata: {
    name: "mongodb-init",
    namespace: "demo",
  },
  spec: {
    repository: {
      name: "mongodb-init-repo",
    },
    rules: [
      {
        snapshots: ["latest"],
      },
    ],
    target: {
      ref: {
        apiVersion: "appcatalog.appscode.com/v1alpha1",
        kind: "AppBinding",
        name: "mongodb",
      },
    },
    task: {
      name: "mongodb-restore-4.2.3-v5",
    },
  },
};
const initScript = {
  scriptPath: "",
  secret: {
    secretName: "",
  },
};
const stashAppscodeComRepositoryInitRepo = {
  apiVersion: "stash.appscode.com/v1alpha1",
  kind: "Repository",
  metadata: {
    name: "",
    namespace: "",
  },
  spec: {
    backend: {
      gcs: {
        bucket: "stash-testing",
        prefix: "/demo/mongodb",
      },
      storageSecretName: "",
    },
  },
};
const stashAppscodeComRepositoryRepo = {
  apiVersion: "stash.appscode.com/v1alpha1",
  kind: "Repository",
  metadata: {
    name: "",
    namespace: "",
  },
  spec: {
    backend: {
      gcs: {
        bucket: "stash-testing",
        prefix: "/demo/mongodb",
      },
      storageSecretName: "",
    },
  },
};
const restoreSessionInitRunTimeSettings = {
  container: {
    resources: {
      requests: {
        cpu: "",
        memory: "",
      },
      limits: {
        cpu: "",
        memory: "",
      },
    },
    nice: {
      adjustment: null,
    },
    ionice: {
      class: null,
      classData: null,
    },
    securityContext: {
      privileged: false,
      runAsNonRoot: false,
      runAsUser: null,
      runAsGroup: null,
      seLinuxOptions: {
        level: "",
        role: "",
        type: "",
        user: "",
      },
    },
    env: [],
    envFrom: [],
  },
  pod: {
    serviceAccountName: "",
    imagePullSecrets: [],
    securityContext: {
      fsGroup: null,
      runAsNonRoot: false,
      runAsUser: null,
      runAsGroup: null,
      seLinuxOptions: {
        level: "",
        role: "",
        type: "",
        user: "",
      },
    },
  },
};
const repoBackendMap = {
  azure: { container: "", prefix: "", maxConnections: 1 },
  b2: { bucket: "", prefix: "", maxConnections: 1 },
  gcs: { bucket: "", prefix: "", maxConnections: 1 },
  local: { hostPath: { path: "", mountPath: "", subPath: "" } },
  rest: { url: "" },
  s3: { endpoint: "", bucket: "", prefix: "", region: "" },
  swift: { container: "", prefix: "" },
};
const volumeSourceMap = {
  hostPath: { path: "", mountPath: "", subPath: "" },
  nfs: { path: "", server: "", mountPath: "", subPath: "" },
  persistentVolumeClaim: { claimName: "", mountPath: "", subPath: "" },
};
const stashAppscodeComBackupConfiguration = {
  apiVersion: "stash.appscode.com/v1beta1",
  kind: "BackupConfiguration",
  metadata: {
    name: "",
    namespace: "",
  },
  spec: {
    repository: {
      name: "",
    },
    retentionPolicy: {
      keepLast: 3,
      name: "",
      prune: true,
    },
    schedule: "*/5 * * * *",
    target: {
      ref: {
        apiVersion: "appcatalog.appscode.com/v1alpha1",
        kind: "AppBinding",
        name: "",
      },
    },
    task: {
      name: "",
    },
  },
};

function valueExists(value, getValue, path) {
  const val = getValue(value, path);
  if (val) return true;
  else return false;
}

async function getNamespacedResourceList(
  axios,
  storeGet,
  { namespace, group, version, resource }
) {
  const owner = storeGet("/user/username");
  const cluster = storeGet("/clusterInfo/name");

  const url = `/clusters/${owner}/${cluster}/proxy/${group}/${version}/namespaces/${namespace}/${resource}`;

  let ans = [];
  try {
    const resp = await axios.get(url, {
      params: {
        filter: { items: { metadata: { name: null }, type: null } },
      },
    });

    const items = (resp && resp.data && resp.data.items) || [];
    ans = items;
  } catch (e) {
    console.log(e);
  }

  return ans;
}

async function getResourceList(axios, storeGet, { group, version, resource }) {
  const owner = storeGet("/user/username");
  const cluster = storeGet("/clusterInfo/name");

  const url = `/clusters/${owner}/${cluster}/proxy/${group}/${version}/${resource}`;

  let ans = [];
  try {
    const resp = await axios.get(url, {
      params: {
        filter: { items: { metadata: { name: null }, type: null } },
      },
    });

    const items = (resp && resp.data && resp.data.items) || [];
    ans = items;
  } catch (e) {
    console.log(e);
  }

  return ans;
}

async function resourceNames(
  { axios, getValue, model, watchDependency, storeGet },
  group,
  version,
  resource
) {
  const namespace = getValue(model, "/metadata/release/namespace");
  watchDependency("model#/metadata/release/namespace");

  let resources = await getNamespacedResourceList(axios, storeGet, {
    namespace,
    group,
    version,
    resource,
  });

  if (resource === "secrets") {
    resources = resources.filter((item) => {
      const validType = ["kubernetes.io/service-account-token", "Opaque"];
      return validType.includes(item.type);
    });
  }

  return resources.map((resource) => {
    const name = (resource.metadata && resource.metadata.name) || "";
    return {
      text: name,
      value: name,
    };
  });
}

async function unNamespacedResourceNames(
  { axios, storeGet },
  group,
  version,
  resource
) {
  let resources = await getResourceList(axios, storeGet, {
    group,
    version,
    resource,
  });

  if (resource === "secrets") {
    resources = resources.filter((item) => {
      const validType = ["kubernetes.io/service-account-token", "Opaque"];
      return validType.includes(item.type);
    });
  }

  return resources.map((resource) => {
    const name = (resource.metadata && resource.metadata.name) || "";
    return {
      text: name,
      value: name,
    };
  });
}

function initPrePopulateDatabase({ getValue, model }) {
  const waitForInitialRestore = getValue(
    model,
    "/resources/kubedbComMongoDB/spec/init/waitForInitialRestore"
  );
  const stashAppscodeComRestoreSessionInit = getValue(
    model,
    "/resources/stashAppscodeComRestoreSessionInit"
  );
  const script = getValue(
    model,
    "/resources/kubedbComMongoDB/spec/init/script"
  );

  return waitForInitialRestore ||
    !!stashAppscodeComRestoreSessionInit ||
    !!script
    ? "yes"
    : "no";
}

function onPrePopulateDatabaseChange({
  commit,
  getValue,
  discriminator,
  model,
}) {
  const prePopulateDatabase = getValue(discriminator, "/prePopulateDatabase");
  if (prePopulateDatabase === "no") {
    // delete related properties
    commit("wizard/model$update", {
      path: "/resources/kubedbComMongoDB/spec/init/waitForInitialRestore",
      value: false,
    });
    commit(
      "wizard/model$delete",
      "/resources/stashAppscodeComRestoreSessionInit"
    );
    commit(
      "wizard/model$delete",
      "/resources/kubedbComMongoDB/spec/init/script"
    );
  } else {
    // set stashAppscodeComRestoreSessionInit if it doesn't exist
    if (
      !valueExists(
        model,
        getValue,
        "/resources/stashAppscodeComRestoreSessionInit"
      )
    )
      commit("wizard/model$update", {
        path: "/resources/stashAppscodeComRestoreSessionInit",
        value: stashAppscodeComRestoreSessionInit,
      });
  }
}

function initDataSource({ getValue, model }) {
  const script = getValue(
    model,
    "/resources/kubedbComMongoDB/spec/init/script"
  );
  const stashAppscodeComRestoreSessionInit = getValue(
    model,
    "/resources/stashAppscodeComRestoreSessionInit"
  );

  if (script) return "script";
  else if (stashAppscodeComRestoreSessionInit) return "stashBackup";
  else return undefined;
}

function onDataSourceChange({ commit, getValue, discriminator, model }) {
  const dataSource = getValue(discriminator, "/dataSource");
  if (dataSource === "script") {
    commit(
      "wizard/model$delete",
      "/resources/stashAppscodeComRestoreSessionInit"
    );

    // create a new script if there is no script property
    if (
      !valueExists(
        model,
        getValue,
        "/resources/kubedbComMongoDB/spec/init/script"
      )
    )
      commit("wizard/model$update", {
        path: "/resources/kubedbComMongoDB/spec/init/script",
        value: initScript,
      });
  } else if (dataSource === "stashBackup") {
    commit(
      "wizard/model$delete",
      "/resources/kubedbComMongoDB/spec/init/script"
    );

    // create a new stashAppscodeComRestoreSessionInit if there is no stashAppscodeComRestoreSessionInit property
    if (
      !valueExists(
        model,
        getValue,
        "/resources/stashAppscodeComRestoreSessionInit"
      )
    )
      commit("wizard/model$update", {
        path: "/resources/stashAppscodeComRestoreSessionInit",
        value: stashAppscodeComRestoreSessionInit,
      });
  }
}

// // for script
function initVolumeType({ getValue, model }) {
  const configMap = getValue(
    model,
    "/resources/kubedbComMongoDB/spec/init/script/configMap/name"
  );
  const secret = getValue(
    model,
    "/resources/kubedbComMongoDB/spec/init/script/secret/secretName"
  );

  if (configMap) return "configMap";
  else if (secret) return "secret";
  else return undefined;
}

function onVolumeTypeChange({ commit, getValue, discriminator, model }) {
  const sourceVolumeType = getValue(discriminator, "/sourceVolumeType");
  if (sourceVolumeType === "configMap") {
    // add configMap object and delete secret object
    commit(
      "wizard/model$delete",
      "/resources/kubedbComMongoDB/spec/init/script/secret"
    );

    if (
      !valueExists(
        model,
        getValue,
        "/resources/kubedbComMongoDB/spec/init/script/configMap"
      )
    ) {
      commit("wizard/model$update", {
        path: "/resources/kubedbComMongoDB/spec/init/script/configMap",
        value: {
          name: "",
        },
      });
    }
  } else if (sourceVolumeType === "secret") {
    // delete configMap object and add secret object
    commit(
      "wizard/model$delete",
      "/resources/kubedbComMongoDB/spec/init/script/configMap"
    );

    if (
      !valueExists(
        model,
        getValue,
        "/resources/kubedbComMongoDB/spec/init/script/secret"
      )
    ) {
      commit("wizard/model$update", {
        path: "/resources/kubedbComMongoDB/spec/init/script/secret",
        value: {
          secretName: "",
        },
      });
    }
  }
}

function showInitializationForm({ getValue, discriminator, watchDependency }) {
  const prePopulateDatabase = getValue(discriminator, "/prePopulateDatabase");
  watchDependency("discriminator#/prePopulateDatabase");
  return prePopulateDatabase === "yes";
}

function showScriptOrStashForm(
  { getValue, discriminator, watchDependency },
  value
) {
  const dataSource = getValue(discriminator, "/dataSource");
  watchDependency("discriminator#/dataSource");
  return dataSource === value;
}

function showConfigMapOrSecretName(
  { getValue, discriminator, watchDependency },
  value
) {
  const sourceVolumeType = getValue(discriminator, "/sourceVolumeType");
  watchDependency("discriminator#/sourceVolumeType");
  return sourceVolumeType === value;
}

// for stash backup
function initializeNamespace({ getValue, model }) {
  const namespace = getValue(model, "/metadata/release/namespace");
  return namespace;
}

function showRepositorySelectOrCreate(
  { getValue, discriminator, watchDependency },
  value
) {
  const repositoryChoise = getValue(discriminator, "/repositoryChoise");
  watchDependency("discriminator#/repositoryChoise");

  return repositoryChoise === value;
}

function onInitRepositoryChoiseChange({ getValue, discriminator, commit }) {
  const repositoryChoise = getValue(discriminator, "/repositoryChoise");
  if (repositoryChoise === "select") {
    // delete stashAppscodeComRepositoryInitRepo from model
    commit(
      "wizard/model$delete",
      "/resources/stashAppscodeComRepositoryInitRepo"
    );
  } else if (repositoryChoise === "create") {
    // add stashAppscodeComRepositoryInitRepo to model
    commit("wizard/model$update", {
      path: "resources/stashAppscodeComRepositoryInitRepo",
      value: stashAppscodeComRepositoryInitRepo,
    });
  }
}

function onInitRepositoryNameChange({ getValue, model, commit }) {
  const repositoryName = getValue(
    model,
    "resources/stashAppscodeComRepositoryInitRepo/metadata/name"
  );
  // set this name in stashAppscodeComRestoreSessionInit
  commit("wizard/model$update", {
    path: "/resources/stashAppscodeComRestoreSessionInit/spec/repository/name",
    value: repositoryName,
  });
}

// // Repository Backend
function initBackendType({ getValue, model }, prefix) {
  return Object.keys(repoBackendMap).find((key) => {
    const value = getValue(model, `${prefix}/spec/backend/${key}`);

    return value ? true : false;
  });
}

function onBackendTypeChange(
  { commit, getValue, discriminator, model },
  prefix
) {
  const selectedBackendType = getValue(discriminator, "/backendType");

  // delete every other backend type from model  exect the selected one
  Object.keys(repoBackendMap).forEach((key) => {
    if (key !== selectedBackendType) {
      commit("wizard/model$delete", `${prefix}/spec/backend/${key}`);
    }
  });

  // set the selectedBackend type object in
  if (
    !valueExists(
      model,
      getValue,
      `${prefix}/spec/backend/${selectedBackendType}`
    )
  ) {
    commit("wizard/model$update", {
      path: `${prefix}/spec/backend/${selectedBackendType}`,
      value: repoBackendMap[selectedBackendType],
    });
  }
}

function showBackendForm({ getValue, discriminator, watchDependency }, value) {
  const backendType = getValue(discriminator, "/backendType");
  watchDependency("discriminator#/backendType");
  return backendType === value;
}

function initVolumeSource({ getValue, model }, prefix) {
  return Object.keys(volumeSourceMap).find((key) => {
    const value = getValue(model, `${prefix}/spec/backend/local/${key}`);

    return value ? true : false;
  });
}

function onVolumeSourceChange(
  { commit, getValue, discriminator, model },
  prefix
) {
  const selectedVolumeSource = getValue(discriminator, "/volumeSource");

  // delete every other volume source type from model except selected one
  Object.keys(volumeSourceMap).forEach((key) => {
    if (key !== selectedVolumeSource) {
      commit("wizard/model$delete", `${prefix}/spec/backend/local/${key}`);
    }
  });

  // set the selectedVolumeSource object in model
  if (
    !valueExists(
      model,
      getValue,
      `${prefix}/spec/backend/local/${selectedVolumeSource}`
    )
  ) {
    commit("wizard/model$update", {
      path: `${prefix}/spec/backend/local/${selectedVolumeSource}`,
      value: volumeSourceMap[selectedVolumeSource],
    });
  }
}

function showVolumeSourceForm(
  { getValue, discriminator, watchDependency },
  value
) {
  const volumeSource = getValue(discriminator, "/volumeSource");
  watchDependency("discriminator#/volumeSource");
  return volumeSource === value;
}

function initCustomizeRestoreJobRuntimeSettings({ getValue, model }) {
  const runtimeSettings = getValue(
    model,
    "/resources/stashAppscodeComRestoreSessionInit/spec/runtimeSettings"
  );
  if (runtimeSettings) return "yes";
  else return "no";
}

function onCustomizeRestoreJobRuntimeSettingsChange({
  commit,
  getValue,
  discriminator,
  model,
}) {
  const customizeRestoreJobRuntimeSettings = getValue(
    discriminator,
    "/customizeRestoreJobRuntimeSettings"
  );
  if (customizeRestoreJobRuntimeSettings === "no") {
    commit(
      "wizard/model$delete",
      "/resources/stashAppscodeComRestoreSessionInit/spec/runtimeSettings"
    );
  } else if (customizeRestoreJobRuntimeSettings === "yes") {
    if (
      !valueExists(
        model,
        getValue,
        "/resources/stashAppscodeComRestoreSessionInit/spec/runtimeSettings"
      )
    ) {
      // set new value
      commit("wizard/model$update", {
        path:
          "/resources/stashAppscodeComRestoreSessionInit/spec/runtimeSettings",
        value: restoreSessionInitRunTimeSettings,
      });
    }
  }
}

function showRuntimeForm({ discriminator, getValue, watchDependency }, value) {
  const customizeRestoreJobRuntimeSettings = getValue(
    discriminator,
    "/customizeRestoreJobRuntimeSettings"
  );
  watchDependency("discriminator#/customizeRestoreJobRuntimeSettings");
  return customizeRestoreJobRuntimeSettings === value;
}

async function getImagePullSecrets({
  getValue,
  model,
  watchDependency,
  axios,
  storeGet,
}) {
  const namespace = getValue(model, "/metadata/release/namespace");
  watchDependency("model#/metadata/release/namespace");

  let resources = await getNamespacedResourceList(axios, storeGet, {
    namespace,
    group: "core",
    version: "v1",
    resource: "secrets",
  });

  resources = resources.filter((item) => {
    const validType = ["kubernetes.io/dockerconfigjson"];
    return validType.includes(item.type);
  });

  return resources.map((resource) => {
    const name = (resource.metadata && resource.metadata.name) || "";
    return {
      text: name,
      value: { name: name },
    };
  });
}

// for environment variable (stash initialization)
// same as monitoring step

// // for envFrom
function showRefType({ itemCtx }) {
  if (itemCtx.configMapRef) return "ConfigMap";
  else if (itemCtx.secretRef) return "Secret";
  else return "-";
}

function showRefName({ itemCtx }) {
  if (itemCtx.configMapRef) {
    return itemCtx.configMapRef.name;
  } else if (itemCtx.secretRef) {
    return itemCtx.secretRef.name;
  } else {
    return "";
  }
}

function initializeRefType({ rootModel }) {
  if (rootModel.configMapRef) return "configMap";
  else if (rootModel.secretRef) return "secret";
  else return undefined;
}

function onRefTypeChange({
  rootModel,
  getValue,
  discriminator,
  updateModelValue,
}) {
  const refType = getValue(discriminator, "/refType");
  if (refType === "configMap") {
    // delete secretRef
    if (valueExists(rootModel, getValue, "/secretRef"))
      updateModelValue("/secretRef", true);
    // add configMapRef
    if (!valueExists(rootModel, getValue, "/configMapRef"))
      updateModelValue("/configMapRef", false, { name: "" });
  } else {
    // delete configMapRef
    if (valueExists(rootModel, getValue, "/configMapRef"))
      updateModelValue("/configMapRef", true);
    // add secretRef
    if (!valueExists(rootModel, getValue, "/secretRef"))
      updateModelValue("/secretRef", false, { name: "" });
  }
}

function showRefSelect({ discriminator, getValue, watchDependency }, value) {
  const refType = getValue(discriminator, "/refType");
  watchDependency("discriminator#/refType");
  return refType === value;
}

// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// FOR Backup Configuration

// schedule bakcup

function getBackupConfigsAndAnnotations(getValue, model) {
  const stashAppscodeComBackupConfiguration = getValue(
    model,
    "/resources/stashAppscodeComBackupConfiguration"
  );
  const kubedbComMongoDBAnnotations =
    getValue(model, "/resources/kubedbComMongoDB/metadata/annotations") || {};

  const isBluePrint = Object.keys(kubedbComMongoDBAnnotations).some(
    (k) =>
      k === "stash.appscode.com/backup-blueprint" ||
      k === "stash.appscode.com/schedule" ||
      k.startsWith("params.stash.appscode.com/")
  );

  return {
    stashAppscodeComBackupConfiguration,
    isBluePrint,
  };
}

function deleteKubeDbComMongDbAnnotation(getValue, model, commit) {
  const annotations =
    getValue(model, "/resources/kubedbComMongoDB/metadata/annotations") || {};
  const filteredKeyList =
    Object.keys(annotations).filter(
      (k) =>
        k !== "stash.appscode.com/backup-blueprint" &&
        k !== "stash.appscode.com/schedule" &&
        !k.startsWith("params.stash.appscode.com/")
    ) || [];
  const filteredAnnotations = {};
  filteredKeyList.forEach((k) => {
    filteredAnnotations[k] = annotations[k];
  });
  commit("wizard/model$update", {
    path: "/resources/kubedbComMongoDB/metadata/annotations",
    value: filteredAnnotations,
  });
}

function addKubeDbComMongDbAnnotation(
  getValue,
  model,
  commit,
  key,
  value,
  force
) {
  const annotations =
    getValue(model, "/resources/kubedbComMongoDB/metadata/annotations") || {};

  if (annotations[key] === undefined) {
    annotations[key] = value;
  } else if (force) {
    annotations[key] = value;
  }

  commit("wizard/model$update", {
    path: "/resources/kubedbComMongoDB/metadata/annotations",
    value: annotations,
    force: true,
  });
}

function initScheduleBackup({ getValue, model }) {
  const {
    stashAppscodeComBackupConfiguration,
    isBluePrint,
  } = getBackupConfigsAndAnnotations(getValue, model);

  if (stashAppscodeComBackupConfiguration || isBluePrint) return "yes";
  else return "no";
}

function onScheduleBackupChange({ commit, getValue, discriminator, model }) {
  const scheduleBackup = getValue(discriminator, "/scheduleBackup");

  if (scheduleBackup === "no") {
    // delete stashAppscodeComBackupConfiguration
    commit(
      "wizard/model$delete",
      "/resources/stashAppscodeComBackupConfiguration"
    );
    // delete annotation from KubeDBComMongoDB annotation
    deleteKubeDbComMongDbAnnotation(getValue, model, commit);
  } else {
    const { isBluePrint } = getBackupConfigsAndAnnotations(getValue, model);

    // create stashAppscodeComBackupConfiguration and initialize it if not exists

    if (
      !valueExists(
        model,
        getValue,
        "/resources/stashAppscodeComBackupConfiguration"
      ) &&
      !isBluePrint
    ) {
      commit("wizard/model$update", {
        path: "/resources/stashAppscodeComBackupConfiguration",
        value: stashAppscodeComBackupConfiguration,
      });
    }
  }
}

// backup form
function showBackupForm({ getValue, discriminator, watchDependency }) {
  const scheduleBackup = getValue(discriminator, "/scheduleBackup");
  watchDependency("discriminator#/scheduleBackup");

  if (scheduleBackup === "yes") return true;
  else return false;
}

// invoker form
function initBackupInvoker({ getValue, model }) {
  const {
    stashAppscodeComBackupConfiguration,
    isBluePrint,
  } = getBackupConfigsAndAnnotations(getValue, model);

  if (stashAppscodeComBackupConfiguration) return "backupConfiguration";
  else if (isBluePrint) return "backupBlueprint";
  else return undefined;
}

function onBackupInvokerChange({
  getValue,
  discriminator,
  watchDependency,
  commit,
  model,
}) {
  const backupInvoker = getValue(discriminator, "/backupInvoker");
  watchDependency("discriminator#/backupInvoker");

  if (backupInvoker === "backupConfiguration") {
    // delete annotation and create backup config object
    deleteKubeDbComMongDbAnnotation(getValue, model, commit);
    if (
      !valueExists(
        model,
        getValue,
        "/resources/stashAppscodeComBackupConfiguration"
      )
    ) {
      commit("wizard/model$update", {
        path: "/resources/stashAppscodeComBackupConfiguration",
        value: stashAppscodeComBackupConfiguration,
      });
    }
  } else if (backupInvoker === "backupBlueprint") {
    // delete backup configuration object and create the annotation
    commit(
      "wizard/model$delete",
      "/resources/stashAppscodeComBackupConfiguration"
    );
    addKubeDbComMongDbAnnotation(
      getValue,
      model,
      commit,
      "stash.appscode.com/backup-blueprint",
      ""
    );
  }
}

function showInvokerForm({ getValue, discriminator, watchDependency }, value) {
  const backupInvoker = getValue(discriminator, "/backupInvoker");
  watchDependency("discriminator#/backupInvoker");

  return backupInvoker === value;
}

// backup configuration form
function initalizeTargetReferenceName({ getValue, model, watchDependency }) {
  const databaseName = getValue(model, "/metadata/release/name");
  watchDependency("model#/metadata/release/name");

  return databaseName;
}

// backup config repository
function initRepositoryChoise({ getValue, model }) {
  const stashAppscodeComRepositoryRepo = getValue(
    model,
    "/resources/stashAppscodeComRepositoryRepo"
  );

  if (stashAppscodeComRepositoryRepo) return "create";
  else return "select";
}

function onRepositoryChoiseChange({
  getValue,
  discriminator,
  watchDependency,
  commit,
  model,
}) {
  const repositoryChoise = getValue(discriminator, "/repositoryChoise");
  watchDependency("discriminator#/repositoryChoise");

  if (repositoryChoise === "select") {
    // delete the stashAppscodeComRepositoryRepo
    commit("wizard/model$delete", "/resources/stashAppscodeComRepositoryRepo");
  } else if (repositoryChoise === "create") {
    // create new stashAppscodeComRepositoryRepo
    if (
      !valueExists(model, getValue, "/resources/stashAppscodeComRepositoryRepo")
    ) {
      commit("wizard/model$update", {
        path: "/resources/stashAppscodeComRepositoryRepo",
        value: stashAppscodeComRepositoryRepo,
      });
    }
  }
}

function onRepositoryNameChange({ getValue, model, commit }) {
  const repositoryName = getValue(
    model,
    "resources/stashAppscodeComRepositoryRepo/metadata/name"
  );
  // set this name in stashAppscodeComRestoreSessionInit
  commit("wizard/model$update", {
    path: "/resources/stashAppscodeComBackupConfiguration/spec/repository/name",
    value: repositoryName,
  });
}

// backup blueprint form
function getMongoAnnotations(getValue, model) {
  const annotations = getValue(
    model,
    "/resources/kubedbComMongoDB/metadata/annotations"
  );
  return { ...annotations } || {};
}

function initFromAnnotationValue({ getValue, model }, key) {
  const annotations = getMongoAnnotations(getValue, model);
  return annotations[key];
}

function onBackupBlueprintNameChange({
  getValue,
  discriminator,
  commit,
  model,
}) {
  const backupBlueprintName = getValue(discriminator, "/backupBlueprintName");
  addKubeDbComMongDbAnnotation(
    getValue,
    model,
    commit,
    "stash.appscode.com/backup-blueprint",
    backupBlueprintName,
    true
  );
}

function onBackupBlueprintScheduleChange({
  getValue,
  discriminator,
  commit,
  model,
}) {
  const backupBlueprintSchedule = getValue(discriminator, "/schedule");
  addKubeDbComMongDbAnnotation(
    getValue,
    model,
    commit,
    "stash.appscode.com/schedule",
    backupBlueprintSchedule,
    true
  );
}

function initFromAnnotationKeyValue({ getValue, model }, prefix) {
  const annotations = getMongoAnnotations(getValue, model);
  const newOb = {};
  Object.keys(annotations).forEach((key) => {
    if (key.startsWith(prefix)) {
      const newKey = key.replace(prefix, "");
      newOb[newKey] = annotations[key];
    }
  });
  return newOb;
}

function onTaskParametersChange({ getValue, discriminator, model, commit }) {
  const taskParameters = getValue(discriminator, "/taskParameters");

  const taskParamterKeys = Object.keys(taskParameters).map(
    (tp) => `params.stash.appscode.com/${tp}`
  );
  const oldAnnotations =
    getValue(model, "/resources/kubedbComMongoDB/metadata/annotations") || {};
  const newAnnotations = {};

  const filteredAnnotationKeys = Object.keys(oldAnnotations).filter(
    (key) =>
      !taskParamterKeys.includes(key) &&
      !key.startsWith("params.stash.appscode.com/")
  );

  filteredAnnotationKeys.forEach((key) => {
    newAnnotations[key] = oldAnnotations[key];
  });

  Object.keys(taskParameters).forEach((tpk) => {
    newAnnotations[`params.stash.appscode.com/${tpk}`] = taskParameters[tpk];
  });

  commit("wizard/model$update", {
    path: "/resources/kubedbComMongoDB/metadata/annotations",
    value: newAnnotations,
  });
}

function isValueExistInModel({ model, getValue }, path) {
  const modelValue = getValue(model, path);
  return !!modelValue;
}

return {
  isEqualToModelPathValue,
  showAuthPasswordField,
  showAuthSecretField,
  showNewSecretCreateField,
  showCommonStorageClassAndSizeField,
  setApiGroup,
  setDatabaseMode,
  deleteDatabaseModePath,
  showTlsConfigureSection,
  onTlsConfigureChange,
  showMonitoringSection,
  onEnableMonitoringChange,
  showCustomizeExporterSection,
  onCustomizeExporterChange,
  isEqualToDatabaseMode,
  getValueFrom,
  getRefName,
  getKeyOrValue,
  setValueFrom,
  isEqualToValueFromType,
  isConfigMapTypeValueFrom,
  isSecretTypeValueFrom,
  isInputTypeValueFrom,
  onValueFromChange,
  showSecretSelectField,
  showSecretInputField,
  setValueFromModel,
  isEqualToDiscriminatorPath,
  onConfigSecretNameChange,
  initPrePopulateDatabase,
  onPrePopulateDatabaseChange,
  initDataSource,
  onDataSourceChange,
  initVolumeType,
  onVolumeTypeChange,
  showInitializationForm,
  showScriptOrStashForm,
  showConfigMapOrSecretName,
  initializeNamespace,
  showRepositorySelectOrCreate,
  onInitRepositoryChoiseChange,
  onInitRepositoryNameChange,
  initBackendType,
  onBackendTypeChange,
  showBackendForm,
  initVolumeSource,
  onVolumeSourceChange,
  showVolumeSourceForm,
  initCustomizeRestoreJobRuntimeSettings,
  onCustomizeRestoreJobRuntimeSettingsChange,
  showRuntimeForm,
  showRefType,
  showRefName,
  initializeRefType,
  onRefTypeChange,
  showRefSelect,
  initScheduleBackup,
  onScheduleBackupChange,
  showBackupForm,
  initBackupInvoker,
  onBackupInvokerChange,
  showInvokerForm,
  initalizeTargetReferenceName,
  initRepositoryChoise,
  onRepositoryChoiseChange,
  onRepositoryNameChange,
  initFromAnnotationValue,
  onBackupBlueprintNameChange,
  onBackupBlueprintScheduleChange,
  initFromAnnotationKeyValue,
  onTaskParametersChange,

  getIssuerRefsName,
  hasIssuerRefName,
  hasNoIssuerRefName,
  getResources,
  getMongoDbVersions,
  getSecrets,
  hasExistingSecret,
  hasNoExistingSecret,
  showConfigMapSelectField,
  showConfigMapInputField,
  getSecretKeys,
  hasSecretKeys,
  hasNoSecretKeys,
  getConfigMapKeys,
  hasConfigMapKeys,
  hasNoConfigMapKeys,
  resourceNames,
  unNamespacedResourceNames,
  getImagePullSecrets,
  isValueExistInModel,
};
