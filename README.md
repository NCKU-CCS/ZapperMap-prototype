# zapper-web

## Setup

### Install Dependency

```sh
$: pipenv install
```

### Postgis

macOS

```
$: brew install postgis
```

createuser & createdb

```
$: createdb zapper
$: createuser -P -s -e zapper_user
$: Enter password for new role: zapper_secret
$: Enter it again: zapper_secret
```
