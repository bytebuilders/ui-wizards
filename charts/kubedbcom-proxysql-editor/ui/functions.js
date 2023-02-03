// *************************      common functions ********************************************
// eslint-disable-next-line no-empty-pattern
async function fetchJsons({ axios, itemCtx }) {
  let ui = {};
  let language = {};
  let functions = {};
  const { name, url, version, packageviewUrlPrefix } = itemCtx.chart;

  try {
    ui = await axios.get(
      `${packageviewUrlPrefix}/create-ui.yaml?name=${name}&url=${url}&version=${version}&format=json`
    );
    language = await axios.get(
      `${packageviewUrlPrefix}/language.yaml?name=${name}&url=${url}&version=${version}&format=json`
    );
    const functionString = await axios.get(
      `${packageviewUrlPrefix}/functions.js?name=${name}&url=${url}&version=${version}`
    );
    // declare evaluate the functionString to get the functions Object
    const evalFunc = new Function(functionString.data || "");
    functions = evalFunc();
  } catch (e) {
    console.log(e);
  }

  return {
    ui: ui.data || {},
    language: language.data || {},
    functions,
  };
}

function disableLableChecker({ itemCtx }) {
  const { key } = itemCtx;
  if (key.startsWith("app.kubernetes.io") || key.includes("helm")) return true;
  else return false;
}

function isEqualToModelPathValue(
  { model, getValue, watchDependency },
  value,
  modelPath
) {
  const modelPathValue = getValue(model, modelPath);
  watchDependency("model#" + modelPath);
  return modelPathValue === value;
}

async function getResources({ axios, storeGet }, group, version, resource) {
  const owner = storeGet("/route/params/user");
  const cluster = storeGet("/route/params/cluster");

  try {
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
  } catch (e) {
    console.log(e);
    return [];
  }
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

function setValueFromModel({ getValue, model }, path) {
  return getValue(model, path);
}

async function getNamespacedResourceList(
  axios,
  storeGet,
  { namespace, group, version, resource }
) {
  const owner = storeGet("/route/params/user");
  const cluster = storeGet("/route/params/cluster");

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
  const owner = storeGet("/route/params/user");
  const cluster = storeGet("/route/params/cluster");

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

function returnTrue() {
  return true;
}

function returnFalse() {
  return false;
}

function returnStringYes() {
  return "yes";
}

// ************************* Basic Info **********************************************
async function getProxySQLVersions({ axios, storeGet }) {
  const owner = storeGet("/route/params/user");
  const cluster = storeGet("/route/params/cluster");

  const queryParams = {
    filter: {
      items: {
        metadata: { name: null },
        spec: { version: null, deprecated: null },
      },
    },
  };

  try {
    const resp = await axios.get(
      `/clusters/${owner}/${cluster}/proxy/catalog.kubedb.com/v1alpha1/proxysqlversions`,
      {
        params: queryParams,
      }
    );

    const resources = (resp && resp.data && resp.data.items) || [];

    // keep only non deprecated versions
    const filteredDbVersions = resources.filter(
      (item) => item.spec && !item.spec.deprecated
    );

    filteredDbVersions.map((item) => {
      const name = (item.metadata && item.metadata.name) || "";
      const specVersion = (item.spec && item.spec.version) || "";
      item.text = `${name} (${specVersion})`;
      item.value = name;
      return true;
    });
    return filteredDbVersions;
  } catch (e) {
    console.log(e);
    return [];
  }
}

async function getAppBindings({ axios, storeGet }) {
  const owner = storeGet("/route/params/user");
  const cluster = storeGet("/route/params/cluster");

  const queryParams = {
    filter: {
      items: {
        metadata: { name: null },
        spec: { type: null },
      },
    },
  };

  try {
    const resp = await axios.get(
      `/clusters/${owner}/${cluster}/proxy/appcatalog.appscode.com/v1alpha1/appbindings`,
      {
        params: queryParams,
      }
    );

    const resources = (resp && resp.data && resp.data.items) || [];

    const fileredResources = resources
      .filter(
        (item) =>
          item.spec?.type === "kubedb.com/mysql" ||
          item.spec?.type === "kubedb.com/mariadb"
      )
      .map((item) => {
        const name = (item.metadata && item.metadata.name) || "";
        return {
          text: name,
          value: name,
        };
      });
    return fileredResources;
  } catch (e) {
    console.log(e);
    return [];
  }
}

// ********************* Database Mode ***********************
function setDatabaseMode({ model, getValue, watchDependency }) {
  const replicas = getValue(
    model,
    "/resources/kubedbComProxySQL/spec/replicas"
  );
  watchDependency("model#/resources/kubedbComProxySQL/spec/replicas");

  return replicas > 1 ? "Cluster" : "Standalone";
}

function onDatabaseModeChange({ discriminator, getValue, commit }) {
  const mode = getValue(discriminator, "/activeDatabaseMode");

  if (mode === "Standalone") {
    commit("wizard/model$update", {
      path: "/resources/kubedbComProxySQL/spec/replicas",
      value: 1,
      force: true,
    });
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

// ************************** TLS ******************************88

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
  const owner = storeGet("/route/params/user");
  const cluster = storeGet("/route/params/cluster");
  watchDependency(
    "model#/resources/kubedbComProxySQL/spec/tls/issuerRef/apiGroup"
  );
  watchDependency("model#/resources/kubedbComProxySQL/spec/tls/issuerRef/kind");
  watchDependency("model#/metadata/release/namespace");
  const apiGroup = getValue(
    model,
    "/resources/kubedbComProxySQL/spec/tls/issuerRef/apiGroup"
  );
  const kind = getValue(
    model,
    "/resources/kubedbComProxySQL/spec/tls/issuerRef/kind"
  );
  const namespace = getValue(model, "/metadata/release/namespace");

  let url;
  if (kind === "Issuer") {
    url = `/clusters/${owner}/${cluster}/proxy/${apiGroup}/v1/namespaces/${namespace}/issuers`;
  } else if (kind === "ClusterIssuer") {
    url = `/clusters/${owner}/${cluster}/proxy/${apiGroup}/v1/clusterissuers`;
  }

  if (!url) return [];

  try {
    const resp = await axios.get(url);

    const resources = (resp && resp.data && resp.data.items) || [];

    resources.map((item) => {
      const name = (item.metadata && item.metadata.name) || "";
      item.text = name;
      item.value = name;
      return true;
    });
    return resources;
  } catch (e) {
    console.log(e);
    return [];
  }
}

async function hasIssuerRefName({
  axios,
  storeGet,
  getValue,
  model,
  watchDependency,
}) {
  const resp = await getIssuerRefsName({
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
  const resp = await hasIssuerRefName({
    axios,
    storeGet,
    getValue,
    model,
    watchDependency,
  });

  return !resp;
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
      path: "/resources/kubedbComProxySQL/spec/tls",
      value: { issuerRef: {}, certificates: [] },
      force: true,
    });
  } else {
    commit("wizard/model$delete", "/resources/kubedbComProxySQL/spec/tls");
    commit("wizard/model$delete", "/resources/kubedbComProxySQL/spec/sslMode");
  }
}

function getAliasOptions() {
  return ["server", "client", "metrics-exporter"];
}

/****** Monitoring *********/

function showMonitoringSection({ watchDependency, discriminator, getValue }) {
  watchDependency("discriminator#/enableMonitoring");
  const configureStatus = getValue(discriminator, "/enableMonitoring");
  return configureStatus;
}

function onEnableMonitoringChange({ discriminator, getValue, commit }) {
  const configureStatus = getValue(discriminator, "/enableMonitoring");
  if (configureStatus) {
    commit("wizard/model$update", {
      path: "/resources/kubedbComProxySQL/spec/monitor",
      value: {},
      force: true,
    });
  } else {
    commit("wizard/model$delete", "/resources/kubedbComProxySQL/spec/monitor");
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
      path: "/resources/kubedbComProxySQL/spec/monitor/prometheus/exporter",
      value: {},
      force: true,
    });
  } else {
    commit(
      "wizard/model$delete",
      "/resources/kubedbComProxySQL/spec/monitor/prometheus/exporter"
    );
  }
}

function isValueExistInModel({ model, getValue }, path) {
  const modelValue = getValue(model, path);
  return !!modelValue;
}

function onNamespaceChange({ commit, model, getValue }) {
  const namespace = getValue(model, "/metadata/release/namespace");
  const agent = getValue(
    model,
    "/resources/kubedbComProxySQL/spec/monitor/agent"
  );
  if (agent === "prometheus.io") {
    commit("wizard/model$update", {
      path: "/resources/monitoringCoreosComServiceMonitor/spec/namespaceSelector/matchNames",
      value: [namespace],
      force: true,
    });
  }
}

function onLabelChange({ commit, model, getValue }) {
  const labels = getValue(
    model,
    "/resources/kubedbComProxySQL/spec/metadata/labels"
  );

  const agent = getValue(
    model,
    "/resources/kubedbComProxySQL/spec/monitor/agent"
  );

  if (agent === "prometheus.io") {
    commit("wizard/model$update", {
      path: "/resources/monitoringCoreosComServiceMonitor/spec/selector/matchLabels",
      value: labels,
      force: true,
    });
  }
}

function onNameChange({ commit, model, getValue }) {
  const dbName = getValue(model, "/metadata/release/name");

  const agent = getValue(
    model,
    "/resources/kubedbComProxySQL/spec/monitor/agent"
  );

  const labels = getValue(
    model,
    "/resources/kubedbComProxySQL/spec/metadata/labels"
  );

  if (agent === "prometheus.io") {
    commit("wizard/model$update", {
      path: "/resources/monitoringCoreosComServiceMonitor/spec/selector/matchLabels",
      value: labels,
      force: true,
    });
  }

  // to reset configSecret name field
  const hasSecretConfig = getValue(model, "/resources/secret_config");
  if (hasSecretConfig) {
    commit("wizard/model$update", {
      path: "/resources/kubedbComProxySQL/spec/configSecret/name",
      value: `${dbName}-config`,
      force: true,
    });
  }
}

function onAgentChange({ commit, model, getValue }) {
  const agent = getValue(
    model,
    "/resources/kubedbComProxySQL/spec/monitor/agent"
  );
  if (agent === "prometheus.io") {
    commit("wizard/model$update", {
      path: "/resources/monitoringCoreosComServiceMonitor/spec/endpoints",
      value: [],
      force: true,
    });

    onNamespaceChange({ commit, model, getValue });
    onLabelChange({ commit, model, getValue });
  } else {
    commit(
      "wizard/model$delete",
      "/resources/monitoringCoreosComServiceMonitor"
    );
  }
}

/*************************************  Database Secret Section ********************************************/

function getCreateAuthSecret({ model, getValue }) {
  const authSecret = getValue(
    model,
    "/resources/kubedbComProxySQL/spec/authSecret"
  );

  return !authSecret;
}

function showExistingSecretSection({
  getValue,
  watchDependency,
  discriminator,
}) {
  watchDependency("discriminator#/createAuthSecret");
  const hasAuthSecretName = getValue(discriminator, "/createAuthSecret");
  return !hasAuthSecretName;
}

function showPasswordSection({ getValue, watchDependency, discriminator }) {
  return !showExistingSecretSection({
    getValue,
    watchDependency,
    discriminator,
  });
}

function setAuthSecretPassword({ model, getValue }) {
  const encodedPassword = getValue(
    model,
    "/resources/secret_auth/data/password"
  );
  return encodedPassword ? decodePassword({}, encodedPassword) : "";
}

function onAuthSecretPasswordChange({ getValue, discriminator, commit }) {
  const stringPassword = getValue(discriminator, "/password");

  if (stringPassword) {
    commit("wizard/model$update", {
      path: "/resources/secret_auth/data/password",
      value: encodePassword({}, stringPassword),
      force: true,
    });
    commit("wizard/model$update", {
      path: "/resources/secret_auth/data/username",
      value: encodePassword({}, "root"),
      force: true,
    });
  } else {
    commit("wizard/model$delete", "/resources/secret_auth");
  }
}

function disableInitializationSection({ model, getValue, watchDependency }) {
  const initialized = getValue(
    model,
    "/resources/kubedbComProxySQL/spec/init/initialized"
  );
  watchDependency("model#/resources/kubedbComProxySQL/spec/init/initialized");
  return !!initialized;
}

// eslint-disable-next-line no-empty-pattern
function encodePassword({}, value) {
  return btoa(value);
}

// eslint-disable-next-line no-empty-pattern
function decodePassword({}, value) {
  return atob(value);
}

function onCreateAuthSecretChange({ discriminator, getValue, commit }) {
  const createAuthSecret = getValue(discriminator, "/createAuthSecret");
  if (createAuthSecret) {
    commit(
      "wizard/model$delete",
      "/resources/kubedbComProxySQL/spec/authSecret"
    );
  } else if (createAuthSecret === false) {
    commit("wizard/model$delete", "/resources/secret_auth");
  }
}

async function getSecrets({
  storeGet,
  axios,
  model,
  getValue,
  watchDependency,
}) {
  const owner = storeGet("/route/params/user");
  const cluster = storeGet("/route/params/cluster");
  const namespace = getValue(model, "/metadata/release/namespace");
  watchDependency("model#/metadata/release/namespace");

  if (owner && cluster && namespace) {
    try {
      const resp = await axios.get(
        `/clusters/${owner}/${cluster}/proxy/core/v1/namespaces/${namespace}/secrets`,
        {
          params: {
            filter: {
              items: {
                data: { username: null, password: null },
                metadata: { name: null },
                type: null,
              },
            },
          },
        }
      );

      const secrets = (resp && resp.data && resp.data.items) || [];

      const filteredSecrets = secrets.filter((item) => {
        const validType = [
          "kubernetes.io/service-account-token",
          "Opaque",
          "kubernetes.io/basic-auth",
        ];
        return (
          validType.includes(item.type) &&
          item.data?.username &&
          item.data?.password
        );
      });

      filteredSecrets.map((item) => {
        const name = (item.metadata && item.metadata.name) || "";
        item.text = name;
        item.value = name;
        return true;
      });
      return filteredSecrets;
    } catch (e) {
      console.log(e);
    }
  }
  return [];
}

//////////////////// custom config /////////////////
function onConfigurationSourceChange({
  getValue,
  discriminator,
  commit,
  model,
}) {
  const configurationSource = getValue(discriminator, "/configurationSource");
  if (configurationSource === "use-existing-config") {
    commit("wizard/model$delete", "/resources/secret_config");
  } else {
    const value = getValue(model, "/resources/secret_config");
    if (!value) {
      commit("wizard/model$update", {
        path: "/resources/secret_config",
        value: {},
        force: true,
      });
    }
    const configSecretName = `${getValue(
      model,
      "/metadata/release/name"
    )}-config`;
    commit("wizard/model$update", {
      path: "/resources/kubedbComProxySQL/spec/configSecret/name",
      value: configSecretName,
      force: true,
    });
  }
}

function onConfigurationChange({ getValue, commit, discriminator, model }) {
  const value = getValue(discriminator, "/configuration");
  commit("wizard/model$update", {
    path: "/resources/secret_config/stringData/md-config.cnf",
    value: value,
    force: true,
  });
  const configSecretName = `${getValue(
    model,
    "/metadata/release/name"
  )}-config`;
  commit("wizard/model$update", {
    path: "/resources/kubedbComProxySQL/spec/configSecret/name",
    value: configSecretName,
    force: true,
  });
}

function setConfigurationSource({ model, getValue }) {
  const modelValue = getValue(model, "/resources/secret_config");
  if (modelValue) {
    return "create-new-config";
  }
  return "use-existing-config";
}

function onConfigurationValueChange({ discriminator, getValue, commit }, path) {
  const value = getValue(discriminator, `/${path}`);
  commit("wizard/model$update", {
    path: `/resources/secret_config/stringData/${path}.cnf`,
    value,
    force: true,
  });
}

function setCustomConfigConfigureChoice({ model, getValue }) {
  const customConfig = getValue(
    model,
    "/resources/kubedbComProxySQL/spec/configSecret"
  );
  return customConfig ? "yes" : "no";
}

function onSetCustomConfigChange({ discriminator, getValue, commit }) {
  const value = getValue(discriminator, "/setCustomConfig");

  if (value === "no") {
    commit(
      "wizard/model$delete",
      "/resources/kubedbComProxySQL/spec/configSecret"
    );
    commit("wizard/model$delete", "/resources/secret_config");
  }
}

function getOpsRequestUrl({ storeGet, model, getValue, mode }, reqType) {
  const cluster = storeGet("/route/params/cluster");
  const domain = storeGet("/domain") || "";
  const owner = storeGet("/route/params/user");
  const dbname = getValue(model, "/metadata/release/name");
  const group = getValue(model, "/metadata/resource/group");
  const kind = getValue(model, "/metadata/resource/kind");
  const namespace = getValue(model, "/metadata/release/namespace");
  const resource = getValue(model, "/metadata/resource/name");
  const version = getValue(model, "/metadata/resource/version");
  const routeRootPath = storeGet("/route/path");
  const pathPrefix = `${domain}${routeRootPath}`;

  if (mode === "standalone-step")
    return `${pathPrefix}?namespace=${namespace}&applyAction=create-opsrequest-${reqType.toLowerCase()}`;
  else
    return `${domain}/${owner}/kubernetes/${cluster}/ops.kubedb.com/v1alpha1/proxysqlopsrequests/create?name=${dbname}&namespace=${namespace}&group=${group}&version=${version}&resource=${resource}&kind=${kind}&page=operations${
      reqType ? "&requestType=" + reqType : ""
    }`;
}

function onMySQLRulesChange({ discriminator, getValue, commit }) {
  const rules = getValue(discriminator, "/mysqlQueryRules");
  const modifiedRules = rules?.map((item) => item.rules);

  commit("wizard/model$update", {
    path: "/resources/kubedbComProxySQL/spec/initConfig/mysqlQueryRules",
    value: modifiedRules,
    force: true,
  });
}

function setMySQLRules({ model, getValue, setDiscriminatorValue }) {
  const rules = getValue(
    model,
    "/resources/kubedbComProxySQL/spec/initConfig/mysqlQueryRules"
  );
  const modifiedRules = rules?.map((item) => ({ rules: item }));

  setDiscriminatorValue("/mysqlQueryRules", modifiedRules);

  return modifiedRules;
}

function getCreateNameSpaceUrl({ model, getValue, storeGet }) {
  const user = storeGet("/route/params/user");
  const cluster = storeGet("/cluster/clusterDefinition/spec/name");

  const domain = storeGet("/domain") || "";
  if (domain.includes("bb.test")) {
    return `http://console.bb.test:5990/${user}/kubernetes/${cluster}/core/v1/namespaces/create`;
  } else {
    const editedDomain = domain.replace("kubedb", "console");
    return `${editedDomain}/${user}/kubernetes/${cluster}/core/v1/namespaces/create`;
  }
}

return {
  fetchJsons,
  disableLableChecker,
  isEqualToModelPathValue,
  getResources,
  isEqualToDiscriminatorPath,
  setValueFromModel,
  getNamespacedResourceList,
  getResourceList,
  resourceNames,
  unNamespacedResourceNames,
  returnTrue,
  returnStringYes,
  getProxySQLVersions,
  getAppBindings,
  setDatabaseMode,
  onDatabaseModeChange,
  isEqualToDatabaseMode,
  setApiGroup,
  getIssuerRefsName,
  hasIssuerRefName,
  hasNoIssuerRefName,
  showTlsConfigureSection,
  onTlsConfigureChange,
  getAliasOptions,
  showMonitoringSection,
  onEnableMonitoringChange,
  showCustomizeExporterSection,
  onCustomizeExporterChange,
  isValueExistInModel,
  onNamespaceChange,
  onLabelChange,
  onNameChange,
  returnFalse,
  onAgentChange,
  getCreateAuthSecret,
  showExistingSecretSection,
  showPasswordSection,
  setAuthSecretPassword,
  onAuthSecretPasswordChange,
  disableInitializationSection,
  encodePassword,
  decodePassword,
  onCreateAuthSecretChange,
  getSecrets,
  onConfigurationSourceChange,
  onConfigurationChange,
  setConfigurationSource,
  onConfigurationValueChange,
  onSetCustomConfigChange,
  setCustomConfigConfigureChoice,
  getOpsRequestUrl,
  onMySQLRulesChange,
  setMySQLRules,
  getCreateNameSpaceUrl,
};
