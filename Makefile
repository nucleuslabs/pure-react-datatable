NM := node_modules/.bin
SRC_FILES = $(shell find src -type f)
.SUFFIXES:
.PHONY: publish

wds: yarn.lock
	BABEL_ENV=webpack $(NM)/webpack-dev-server

dist: yarn.lock $(SRC_FILES)
	NODE_ENV=production $(NM)/bundilio

publish: dist
	cd dist && npm publish

yarn.lock:: package.json
	@yarn install --production=false
	@touch -mr $@ $<

yarn.lock:: node_modules
	@yarn install --production=false --check-files
	@touch -mr $@ $<

clean:
	rm -rf node_modules

node_modules:
	mkdir -p $@