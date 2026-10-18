# Installed distribution verification

Source-tree CI and independent installed-consumer checks prove different things. Source tests cover authored logic and generated drift; the commands here verify the actual packed/distributed JS/types/schema/fixtures and standalone Gradle project. No npm or Maven publication is needed. These commands never create versions, tags or releases.

## JavaScript payload

```sh
node scripts/verify-js-consumer.mjs
REACT_VERSION=19.3.1 node scripts/verify-js-consumer.mjs . artifacts/js-react19
```

The command packs existing committed outputs without rebuilding them, installs the archive outside the checkout, tests core/schema/geometry without React installed, then compiles and executes a separate React/TypeScript SSR consumer using public exports. Missing files, broken declarations, schema entry points and React peer integration fail. The package manifest records each asset hash/mode and the archive SHA-256, rejects build caches/environment/key files and private application/secret markers, and requires schemas, fixtures and both third-party licences. It checks the distributed allowlist, not a dry-run approximation.

CI enforces Node 22 and 24 × React/React DOM 18.3.1 and 19.3.1, TypeScript 5.9.3, and matching React 18.3.31/19.3.0 type declarations (React DOM 18.3.7/19.3.0). `engines >=22` is installation eligibility; only the listed matrix is continuously qualified. Core-only usage has no React peer requirement. Browser CI separately tests hydration and pixels.

## Immutable public Git source and native consumers

On an Apple Silicon Mac with JDK 21, Xcode, Android SDK and an explicitly owned iOS simulator, wrap this entire command in the host's device lease:

```sh
node scripts/verify-source-consumer.mjs <full-public-commit-SHA-or-existing-tag> <owned-simulator-UDID> artifacts/source-consumer
```

It makes a cold network clone of the public repository, resolves the tag to an immutable commit, checks out that commit, packs its existing outputs and verifies extracted asset hashes. Two fresh Gradle consumers depend exclusively on the extracted `package/kotlin` source through the documented composite substitution. The Kotlin consumer compiles an actual exported composable, executes public parser/geometry tests on JVM and iOS Simulator arm64, and links an iOS framework. The independent public Android host assembles a debug APK using the same extracted library. No sibling development checkout provides library files.

The report retains the resolved commit, archive/asset/APK/framework hashes, tested toolchain, explicit simulator UDID, and non-skipped test counts. XML results and build logs are retained; zero executed native tests fail. Both React versions are installed/typechecked against that same public pin. Temporary clones/consumers are removed; evidence remains under the supplied directory. Compilation, test execution, Android assembly, native framework linkage and rendering remain separate claims: this command does not assert physical-device, Android emulator or iOS image coverage.

The native matrix is deliberately pinned: JDK 21, Gradle 9.5.1 wrapper, Kotlin 2.4.20, Compose Multiplatform 1.12.1, Android plugin 9.2.1, compile/target API 37 and minimum 26. CI actually executes native tests on an available job-owned simulator runtime and records Xcode; runtime availability is required, not a silent skip. iOS device arm64 remains a source compilation target rather than a hardware-tested matrix entry. Simulator/UIKit rendering and manual ordinary/Duo-or-small captures are governed by [Compose rendering proof](compose-rendering.md).

PR CI verifies the published immutable head commit using these fresh consumers. Before any future release, run the **Verify immutable source distribution** workflow against the intended existing public commit/tag and retain its evidence; inspect the manual UIKit capture evidence separately. This is a verification workflow with read-only repository permissions, not a publication workflow. A green source-tree build or npm dry run alone is insufficient release-consumption evidence.
