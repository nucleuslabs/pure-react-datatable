NM := node_modules/.bin
SRC_FILES = $(shell find src -type f)
.SUFFIXES:
.PHONY: publish

wds: yarn.lock
	BABEL_ENV=webpack $(NM)/webpack-dev-server --mode=development

dist: yarn.lock $(SRC_FILES)
	BABEL_ENV=webpack $(NM)/webpack --mode=production

publish: dist
	yarn version
	cp package.json dist/package.json
	cp README.md dist/README.md
	yarn publish dist

publish-latest: dist
	yarn version
	cp package.json dist/package.json
	cp README.md dist/README.md
	yarn publish dist --tag latest

test: yarn.lock dist
	BABEL_ENV=test node_modules/.bin/jest --coverage

yarn.lock:: package.json
	@yarn install --production=false
	@touch -mr $@ $<

yarn.lock:: node_modules
	@yarn install --production=false --check-files
	@touch -mr $@ $<

clean:
	rm -rf node_modules
	rm -rf dist

node_modules:
	mkdir -p $@