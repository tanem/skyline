STANDALONE_DIR = standalone

build: components index.js skyline.css
	@component build --dev

components: component.json
	@component install --dev

clean:
	rm -fr build components $(STANDALONE_DIR)

test: build
	@npm install
	@testling

standalone: build
	@component build --standalone Skyline --out $(STANDALONE_DIR) --name skyline
	@uglifyjs $(STANDALONE_DIR)/skyline.js > $(STANDALONE_DIR)/skyline.min.js

.PHONY: clean test