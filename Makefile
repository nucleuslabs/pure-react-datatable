NM := node_modules/.bin
.SUFFIXES:

wds: yarn.lock
	BABEL_ENV=webpack $(NM)/webpack-dev-server

prod: yarn.lock
	NODE_ENV=production $(NM)/bundilio

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