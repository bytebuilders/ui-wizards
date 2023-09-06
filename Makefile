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

SHELL=/bin/bash -o pipefail

GO_PKG   := go.bytebuilders.dev
REPO     := $(notdir $(shell pwd))
BIN      := ui-wizards

CRD_OPTIONS          ?= "crd:allowDangerousTypes=true"
# https://github.com/appscodelabs/gengo-builder
CODE_GENERATOR_IMAGE ?= ghcr.io/appscode/gengo:release-1.25
API_GROUPS           ?= wizards:v1alpha1

# This version-strategy uses git tags to set the version string
git_branch       := $(shell git rev-parse --abbrev-ref HEAD)
git_tag          := $(shell git describe --exact-match --abbrev=0 2>/dev/null || echo "")
commit_hash      := $(shell git rev-parse --verify HEAD)
commit_timestamp := $(shell date --date="@$$(git show -s --format=%ct)" --utc +%FT%T)

VERSION          := $(shell git describe --tags --always --dirty)
version_strategy := commit_hash
ifdef git_tag
	VERSION := $(git_tag)
	version_strategy := tag
else
	ifeq (,$(findstring $(git_branch),master HEAD))
		ifneq (,$(patsubst release-%,,$(git_branch)))
			VERSION := $(git_branch)
			version_strategy := branch
		endif
	endif
endif

###
### These variables should not need tweaking.
###

SRC_PKGS := apis # directories which hold app source (not vendored)
SRC_DIRS := $(SRC_PKGS)

DOCKER_PLATFORMS := linux/amd64 linux/arm linux/arm64
BIN_PLATFORMS    := $(DOCKER_PLATFORMS)

# Used internally.  Users should pass GOOS and/or GOARCH.
OS   := $(if $(GOOS),$(GOOS),$(shell go env GOOS))
ARCH := $(if $(GOARCH),$(GOARCH),$(shell go env GOARCH))

BASEIMAGE_PROD   ?= gcr.io/distroless/static-debian11
BASEIMAGE_DBG    ?= debian:bullseye

GO_VERSION       ?= 1.20
BUILD_IMAGE      ?= ghcr.io/appscode/golang-dev:$(GO_VERSION)
CHART_TEST_IMAGE ?= quay.io/helmpack/chart-testing:v3.5.1

OUTBIN = bin/$(OS)_$(ARCH)/$(BIN)
ifeq ($(OS),windows)
  OUTBIN = bin/$(OS)_$(ARCH)/$(BIN).exe
endif

# Directories that we need created to build/test.
BUILD_DIRS  := bin/$(OS)_$(ARCH)     \
               .go/bin/$(OS)_$(ARCH) \
               .go/cache             \
               hack/config           \
               $(HOME)/.credentials  \
               $(HOME)/.kube         \
               $(HOME)/.minikube

DOCKER_REPO_ROOT := /go/src/$(GO_PKG)/$(REPO)

# If you want to build all binaries, see the 'all-build' rule.
# If you want to build all containers, see the 'all-container' rule.
# If you want to build AND push all containers, see the 'all-push' rule.
all: fmt build

# For the following OS/ARCH expansions, we transform OS/ARCH into OS_ARCH
# because make pattern rules don't match with embedded '/' characters.

build-%:
	@$(MAKE) build                        \
	    --no-print-directory              \
	    GOOS=$(firstword $(subst _, ,$*)) \
	    GOARCH=$(lastword $(subst _, ,$*))

all-build: $(addprefix build-, $(subst /,_, $(BIN_PLATFORMS)))

version:
	@echo version=$(VERSION)
	@echo version_strategy=$(version_strategy)
	@echo git_tag=$(git_tag)
	@echo git_branch=$(git_branch)
	@echo commit_hash=$(commit_hash)
	@echo commit_timestamp=$(commit_timestamp)

.PHONY: clientset
clientset:
	@docker run --rm 	                                          \
		-u $$(id -u):$$(id -g)                                    \
		-v /tmp:/.cache                                           \
		-v $$(pwd):$(DOCKER_REPO_ROOT)                            \
		-w $(DOCKER_REPO_ROOT)                                    \
		--env HTTP_PROXY=$(HTTP_PROXY)                            \
		--env HTTPS_PROXY=$(HTTPS_PROXY)                          \
		$(CODE_GENERATOR_IMAGE)                                   \
		/go/src/k8s.io/code-generator/generate-groups.sh          \
			"deepcopy"                                            \
			$(GO_PKG)/$(REPO)/client                              \
			$(GO_PKG)/$(REPO)/apis                                \
			"$(API_GROUPS)"                                       \
			--go-header-file "./hack/license/go.txt"

# Generate openapi schema
.PHONY: openapi
openapi: $(addprefix openapi-, $(subst :,_, $(API_GROUPS)))
	@echo "Generating api/openapi-spec/swagger.json"
	@docker run --rm	                                 \
		-u $$(id -u):$$(id -g)                           \
		-v /tmp:/.cache                                  \
		-v $$(pwd):$(DOCKER_REPO_ROOT)                   \
		-w $(DOCKER_REPO_ROOT)                           \
		--env HTTP_PROXY=$(HTTP_PROXY)                   \
		--env HTTPS_PROXY=$(HTTPS_PROXY)                 \
		--env GO111MODULE=on                             \
		--env GOFLAGS="-mod=vendor"                      \
		$(BUILD_IMAGE)                                   \
		go run hack/gencrd/main.go

openapi-%:
	@echo "Generating openapi schema for $(subst _,/,$*)"
	@docker run --rm	                                 \
		-u $$(id -u):$$(id -g)                           \
		-v /tmp:/.cache                                  \
		-v $$(pwd):$(DOCKER_REPO_ROOT)                   \
		-w $(DOCKER_REPO_ROOT)                           \
		--env HTTP_PROXY=$(HTTP_PROXY)                   \
		--env HTTPS_PROXY=$(HTTPS_PROXY)                 \
		$(CODE_GENERATOR_IMAGE)                          \
		openapi-gen                                      \
			--v 1 --logtostderr                          \
			--go-header-file "./hack/license/go.txt" \
			--input-dirs "$(GO_PKG)/$(REPO)/apis/$(subst _,/,$*),k8s.io/apimachinery/pkg/apis/meta/v1,k8s.io/apimachinery/pkg/api/resource,k8s.io/apimachinery/pkg/runtime,k8s.io/apimachinery/pkg/util/intstr,k8s.io/apimachinery/pkg/version,k8s.io/api/core/v1,k8s.io/api/apps/v1,k8s.io/api/rbac/v1" \
			--output-package "$(GO_PKG)/$(REPO)/apis/$(subst _,/,$*)" \
			--report-filename /tmp/violation_exceptions.list

# Generate CRD manifests
.PHONY: gen-crds
gen-crds:
	@echo "Generating CRD manifests"
	@docker run --rm	                    \
		-u $$(id -u):$$(id -g)              \
		-v /tmp:/.cache                     \
		-v $$(pwd):$(DOCKER_REPO_ROOT)      \
		-w $(DOCKER_REPO_ROOT)              \
	    --env HTTP_PROXY=$(HTTP_PROXY)      \
	    --env HTTPS_PROXY=$(HTTPS_PROXY)    \
		$(CODE_GENERATOR_IMAGE)             \
		controller-gen                      \
			$(CRD_OPTIONS)                  \
			paths="./apis/..."              \
			output:crd:artifacts:config=.crds

.PHONY: label-crds
label-crds: $(BUILD_DIRS)
	@for f in .crds/*.yaml; do \
		echo "applying app.kubernetes.io/name=kubeshield label to $$f"; \
		kubectl label --overwrite -f $$f --local=true -o yaml app.kubernetes.io/name=kubeshield > bin/crd.yaml; \
		mv bin/crd.yaml $$f; \
	done

.PHONY: gen-crd-protos
gen-crd-protos: $(addprefix gen-crd-protos-, $(subst :,_, $(API_GROUPS)))

gen-crd-protos-%:
	@echo "Generating protobuf for $(subst _,/,$*)"
	@docker run --rm                                     \
		-u $$(id -u):$$(id -g)                           \
		-v /tmp:/.cache                                  \
		-v $$(pwd):$(DOCKER_REPO_ROOT)                   \
		-w $(DOCKER_REPO_ROOT)                           \
		--env HTTP_PROXY=$(HTTP_PROXY)                   \
		--env HTTPS_PROXY=$(HTTPS_PROXY)                 \
		$(CODE_GENERATOR_IMAGE)                          \
		go-to-protobuf                                   \
			--go-header-file "./hack/license/go.txt"     \
			--proto-import=$(DOCKER_REPO_ROOT)/vendor    \
			--proto-import=$(DOCKER_REPO_ROOT)/third_party/protobuf \
			--apimachinery-packages=-k8s.io/apimachinery/pkg/api/resource,-k8s.io/apimachinery/pkg/apis/meta/v1,-k8s.io/apimachinery/pkg/apis/meta/v1beta1,-k8s.io/apimachinery/pkg/runtime,-k8s.io/apimachinery/pkg/runtime/schema,-k8s.io/apimachinery/pkg/util/intstr \
			--packages=-k8s.io/api/core/v1,go.bytebuilders.dev/ui-wizards/apis/$(subst _,/,$*)

.PHONY: gen-bindata
gen-bindata:
	@docker run                                                 \
	    -i                                                      \
	    --rm                                                    \
	    -u $$(id -u):$$(id -g)                                  \
	    -v $$(pwd):/src                                         \
	    -w /src/.crds                                        \
		-v /tmp:/.cache                                         \
	    --env HTTP_PROXY=$(HTTP_PROXY)                          \
	    --env HTTPS_PROXY=$(HTTPS_PROXY)                        \
	    $(BUILD_IMAGE)                                          \
	    go-bindata -ignore=\\.go -ignore=\\.DS_Store -mode=0644 -modtime=1573722179 -o bindata.go -pkg .crds ./...

.PHONY: gen-values-schema
gen-values-schema: $(BUILD_DIRS)
	@for dir in charts/*/; do \
		dir=$${dir%*/}; \
		dir=$${dir##*/}; \
		crd_file=.crds/wizards.ui.bytebuilders.dev_$$(echo $$dir | tr -d '-')s.yaml; \
		if [ ! -f $${crd_file} ]; then \
			continue; \
		fi; \
		yq -y --indentless '.spec.versions[0].schema.openAPIV3Schema.properties.spec | del(.description)' $${crd_file} > charts/$${dir}/values.openapiv3_schema.yaml; \
	done

.PHONY: gen-chart-doc
gen-chart-doc: $(shell find $$(pwd)/charts -maxdepth 1 -mindepth 1 -type d -printf 'gen-chart-doc-%f ')

gen-chart-doc-%:
	@if test -f "./charts/$*/doc.yaml"; then \
		echo "Generate $* chart docs";                       \
		docker run --rm 	                                 \
			-u $$(id -u):$$(id -g)                           \
			-v /tmp:/.cache                                  \
			-v $$(pwd):$(DOCKER_REPO_ROOT)                   \
			-w $(DOCKER_REPO_ROOT)                           \
			--env HTTP_PROXY=$(HTTP_PROXY)                   \
			--env HTTPS_PROXY=$(HTTPS_PROXY)                 \
			$(BUILD_IMAGE)                                   \
			chart-doc-gen -d ./charts/$*/doc.yaml -v ./charts/$*/values.yaml > ./charts/$*/README.md ;  \
	fi

.PHONY: manifests
manifests: gen-crds gen-values-schema

.PHONY: gen
gen: clientset manifests gen-chart-doc

CHART_REGISTRY     ?= bytebuilders-ui-dev
CHART_REGISTRY_URL ?= https://raw.githubusercontent.com/bytebuilders/ui-wizards/
CHART_VERSION      ?=
APP_VERSION        ?= $(CHART_VERSION)

.PHONY: update-charts
update-charts: uibuilder-tools $(shell find $$(pwd)/charts -maxdepth 1 -mindepth 1 -type d -printf 'chart-%f ')
	$(UIBUILDER_TOOLS) update-version --wizard-dir=./charts --version=$(CHART_VERSION)

chart-%:
	@$(MAKE) contents-$* gen-chart-doc-$* --no-print-directory

contents-%:
	@if test -f "./charts/$*/doc.yaml"; then \
		yq -y --indentless -i '.repository.name="$(CHART_REGISTRY)"' ./charts/$*/doc.yaml; \
		yq -y --indentless -i '.repository.url="$(CHART_REGISTRY_URL)"' ./charts/$*/doc.yaml; \
	fi
	@if [ -n "$(CHART_VERSION)" ]; then \
		yq -y --indentless -i '.version="$(CHART_VERSION)"' ./charts/$*/Chart.yaml; \
	fi
	@if [ -n "$(APP_VERSION)" ]; then \
		yq -y --indentless -i '.appVersion="$(APP_VERSION)"' ./charts/$*/Chart.yaml; \
	fi

.PHONY: package-charts
package-charts:
	@docker run                                                 \
	    -i                                                      \
	    --rm                                                    \
	    -u $$(id -u):$$(id -g)                                  \
	    -v $$(pwd):/src                                         \
	    -w /src                                                 \
	    -v $$(pwd)/.go/bin/$(OS)_$(ARCH):/go/bin                \
	    -v $$(pwd)/.go/bin/$(OS)_$(ARCH):/go/bin/$(OS)_$(ARCH)  \
	    -v $$(pwd)/.go/cache:/.cache                            \
	    --env HTTP_PROXY=$(HTTP_PROXY)                          \
	    --env HTTPS_PROXY=$(HTTPS_PROXY)                        \
	    $(BUILD_IMAGE)                                          \
	    ./hack/scripts/update-repo.sh

fmt: $(BUILD_DIRS) uibuilder-tools
	@docker run                                                 \
	    -i                                                      \
	    --rm                                                    \
	    -u $$(id -u):$$(id -g)                                  \
	    -v $$(pwd):/src                                         \
	    -w /src                                                 \
	    -v $$(pwd)/.go/bin/$(OS)_$(ARCH):/go/bin                \
	    -v $$(pwd)/.go/bin/$(OS)_$(ARCH):/go/bin/$(OS)_$(ARCH)  \
	    -v $$(pwd)/.go/cache:/.cache                            \
	    --env HTTP_PROXY=$(HTTP_PROXY)                          \
	    --env HTTPS_PROXY=$(HTTPS_PROXY)                        \
	    $(BUILD_IMAGE)                                          \
	    /bin/bash -c "                                          \
	        REPO_PKG=$(GO_PKG)                                  \
	        ./hack/fmt.sh $(SRC_DIRS)                           \
	    "
	$(UIBUILDER_TOOLS) check --wizard-dir=./charts --fmt-only

build: $(OUTBIN)

.PHONY: .go/$(OUTBIN)
$(OUTBIN): $(BUILD_DIRS)
	@echo "making $(OUTBIN)"
	@docker run                                                 \
	    -i                                                      \
	    --rm                                                    \
	    -u $$(id -u):$$(id -g)                                  \
	    -v $$(pwd):/src                                         \
	    -w /src                                                 \
	    -v $$(pwd)/.go/bin/$(OS)_$(ARCH):/go/bin                \
	    -v $$(pwd)/.go/bin/$(OS)_$(ARCH):/go/bin/$(OS)_$(ARCH)  \
	    -v $$(pwd)/.go/cache:/.cache                            \
	    --env HTTP_PROXY=$(HTTP_PROXY)                          \
	    --env HTTPS_PROXY=$(HTTPS_PROXY)                        \
	    $(BUILD_IMAGE)                                          \
	    /bin/bash -c "                                          \
	        ARCH=$(ARCH)                                        \
	        OS=$(OS)                                            \
	        VERSION=$(VERSION)                                  \
	        version_strategy=$(version_strategy)                \
	        git_branch=$(git_branch)                            \
	        git_tag=$(git_tag)                                  \
	        commit_hash=$(commit_hash)                          \
	        commit_timestamp=$(commit_timestamp)                \
	        ./hack/build.sh                                     \
	    "
	@echo

.PHONY: test
test: unit-tests

unit-tests: $(BUILD_DIRS)
	@docker run                                                 \
	    -i                                                      \
	    --rm                                                    \
	    -u $$(id -u):$$(id -g)                                  \
	    -v $$(pwd):/src                                         \
	    -w /src                                                 \
	    -v $$(pwd)/.go/bin/$(OS)_$(ARCH):/go/bin                \
	    -v $$(pwd)/.go/bin/$(OS)_$(ARCH):/go/bin/$(OS)_$(ARCH)  \
	    -v $$(pwd)/.go/cache:/.cache                            \
	    --env HTTP_PROXY=$(HTTP_PROXY)                          \
	    --env HTTPS_PROXY=$(HTTPS_PROXY)                        \
	    $(BUILD_IMAGE)                                          \
	    /bin/bash -c "                                          \
	        ARCH=$(ARCH)                                        \
	        OS=$(OS)                                            \
	        VERSION=$(VERSION)                                  \
	        ./hack/test.sh $(SRC_PKGS)                          \
	    "

CT_COMMAND     ?= lint-and-install
TEST_CHARTS    ?=
KUBE_NAMESPACE ?=

ifeq ($(CT_COMMAND),lint-and-install)
	ct_namespace = --namespace=$(KUBE_NAMESPACE)
endif

ifeq ($(strip $(TEST_CHARTS)),)
	CT_ARGS = --all $(ct_namespace)
else
	CT_ARGS = --charts=$(TEST_CHARTS) $(ct_namespace)
endif

.PHONY: ct
ct: $(BUILD_DIRS)
	@docker run                                                 \
	    -i                                                      \
	    --rm                                                    \
	    -v $$(pwd):/src                                         \
	    -w /src                                                 \
	    --net=host                                              \
	    -v $(HOME)/.kube:/.kube                                 \
	    -v $(HOME)/.minikube:$(HOME)/.minikube                  \
	    -v $(HOME)/.credentials:$(HOME)/.credentials            \
	    -v $$(pwd)/.go/bin/$(OS)_$(ARCH):/go/bin                \
	    -v $$(pwd)/.go/bin/$(OS)_$(ARCH):/go/bin/$(OS)_$(ARCH)  \
	    -v $$(pwd)/.go/cache:/.cache                            \
	    --env HTTP_PROXY=$(HTTP_PROXY)                          \
	    --env HTTPS_PROXY=$(HTTPS_PROXY)                        \
	    --env KUBECONFIG=$(subst $(HOME),,$(KUBECONFIG))        \
	    $(CHART_TEST_IMAGE)                                     \
	    ct $(CT_COMMAND) --debug --validate-maintainers=false $(CT_ARGS)

.PHONY: capi-tests
capi-tests:
	@set -xe;\
	for f in capa capg capz; do \
		helm template -f ./hack/testdata/$$f.yaml charts/kubedbcom-elasticsearch-editor >/dev/null; \
		helm template -f ./hack/testdata/$$f.yaml charts/kubedbcom-elasticsearch-editor-options >/dev/null; \
		helm template -f ./hack/testdata/$$f.yaml charts/kubedbcom-kafka-editor >/dev/null; \
		helm template -f ./hack/testdata/$$f.yaml charts/kubedbcom-kafka-editor-options >/dev/null; \
		helm template -f ./hack/testdata/$$f.yaml charts/kubedbcom-mariadb-editor >/dev/null; \
		helm template -f ./hack/testdata/$$f.yaml charts/kubedbcom-mariadb-editor-options >/dev/null; \
		helm template -f ./hack/testdata/$$f.yaml charts/kubedbcom-memcached-editor >/dev/null; \
		helm template -f ./hack/testdata/$$f.yaml charts/kubedbcom-memcached-editor-options >/dev/null; \
		helm template -f ./hack/testdata/$$f.yaml charts/kubedbcom-mongodb-editor >/dev/null; \
		helm template -f ./hack/testdata/$$f.yaml charts/kubedbcom-mongodb-editor-options >/dev/null; \
		helm template -f ./hack/testdata/$$f.yaml charts/kubedbcom-mysql-editor >/dev/null; \
		helm template -f ./hack/testdata/$$f.yaml charts/kubedbcom-mysql-editor-options >/dev/null; \
		helm template -f ./hack/testdata/$$f.yaml charts/kubedbcom-pgbouncer-editor >/dev/null; \
		helm template -f ./hack/testdata/$$f.yaml charts/kubedbcom-pgbouncer-editor-options >/dev/null; \
		helm template -f ./hack/testdata/$$f.yaml charts/kubedbcom-postgres-editor >/dev/null; \
		helm template -f ./hack/testdata/$$f.yaml charts/kubedbcom-postgres-editor-options >/dev/null; \
		helm template -f ./hack/testdata/$$f.yaml charts/kubedbcom-proxysql-editor >/dev/null; \
		helm template -f ./hack/testdata/$$f.yaml charts/kubedbcom-proxysql-editor-options >/dev/null; \
		helm template -f ./hack/testdata/$$f.yaml charts/kubedbcom-redis-editor >/dev/null; \
		helm template -f ./hack/testdata/$$f.yaml charts/kubedbcom-redis-editor-options >/dev/null; \
	done

ADDTL_LINTERS   := goconst,gofmt,goimports,unparam

.PHONY: lint
lint: $(BUILD_DIRS)
	@echo "running linter"
	@docker run                                                 \
	    -i                                                      \
	    --rm                                                    \
	    -u $$(id -u):$$(id -g)                                  \
	    -v $$(pwd):/src                                         \
	    -w /src                                                 \
	    -v $$(pwd)/.go/bin/$(OS)_$(ARCH):/go/bin                \
	    -v $$(pwd)/.go/bin/$(OS)_$(ARCH):/go/bin/$(OS)_$(ARCH)  \
	    -v $$(pwd)/.go/cache:/.cache                            \
	    --env HTTP_PROXY=$(HTTP_PROXY)                          \
	    --env HTTPS_PROXY=$(HTTPS_PROXY)                        \
	    --env GO111MODULE=on                                    \
	    --env GOFLAGS="-mod=vendor"                             \
	    $(BUILD_IMAGE)                                          \
	    golangci-lint run --enable $(ADDTL_LINTERS) --timeout=10m --skip-files="generated.*\.go$\" --skip-dirs-use-default --skip-dirs=client,vendor

$(BUILD_DIRS):
	@mkdir -p $@

.PHONY: dev
dev: gen fmt

.PHONY: verify
verify: verify-gen verify-modules

.PHONY: verify-modules
verify-modules:
	GO111MODULE=on go mod tidy
	GO111MODULE=on go mod vendor
	@if !(git diff --exit-code HEAD); then \
		echo "go module files are out of date"; exit 1; \
	fi

.PHONY: verify-gen
verify-gen: gen fmt
	@if !(git diff --exit-code HEAD); then \
		echo "generated files are out of date, run make gen"; exit 1; \
	fi

.PHONY: add-license
add-license:
	@echo "Adding license header"
	@docker run --rm 	                                 \
		-u $$(id -u):$$(id -g)                           \
		-v /tmp:/.cache                                  \
		-v $$(pwd):$(DOCKER_REPO_ROOT)                   \
		-w $(DOCKER_REPO_ROOT)                           \
		--env HTTP_PROXY=$(HTTP_PROXY)                   \
		--env HTTPS_PROXY=$(HTTPS_PROXY)                 \
		$(BUILD_IMAGE)                                   \
		ltag -t "./hack/license" --excludes "vendor contrib libbuild" -v

.PHONY: check-license
check-license:
	@echo "Checking files for license header"
	@docker run --rm 	                                 \
		-u $$(id -u):$$(id -g)                           \
		-v /tmp:/.cache                                  \
		-v $$(pwd):$(DOCKER_REPO_ROOT)                   \
		-w $(DOCKER_REPO_ROOT)                           \
		--env HTTP_PROXY=$(HTTP_PROXY)                   \
		--env HTTPS_PROXY=$(HTTPS_PROXY)                 \
		$(BUILD_IMAGE)                                   \
		ltag -t "./hack/license" --excludes "vendor contrib libbuild" --check -v

.PHONY: ci
ci: check-license lint build unit-tests #verify cover

.PHONY: clean
clean:
	rm -rf .go bin

UIBUILDER_TOOLS = $(shell pwd)/bin/uibuilder-tools
.PHONY: uibuilder-tools
uibuilder-tools: ## Download uibuilder-tools locally if necessary.
	GOBIN=$(shell pwd)/bin go install go.bytebuilders.dev/uibuilder-tools@master

# go-get-tool will 'curl' binary from GH repo $2 with version $3 and install it to $1.
PROJECT_DIR := $(shell dirname $(abspath $(lastword $(MAKEFILE_LIST))))
define go-get-tool
@[ -f $(1) ] || { \
set -e ;\
OS=$$(echo `uname`|tr '[:upper:]' '[:lower:]'); \
ARCH=$$(uname -m); \
case $$ARCH in \
  armv5*) ARCH="armv5";; \
  armv6*) ARCH="armv6";; \
  armv7*) ARCH="arm";; \
  aarch64) ARCH="arm64";; \
  x86) ARCH="386";; \
  x86_64) ARCH="amd64";; \
  i686) ARCH="386";; \
  i386) ARCH="386";; \
esac; \
bin=uibuilder-tools-$${OS}-$${ARCH}; \
echo "Downloading $${bin}" ;\
mkdir -p $(PROJECT_DIR)/bin; \
curl -fsSL -o $(1) https://github.com/$(2)/releases/download/$(3)/$${bin}; \
chmod +x $(1); \
}
endef
