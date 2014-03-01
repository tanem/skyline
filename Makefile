STANDALONE_DIR = standalone

build: components index.js realtime-bar-graph.css template.js
	@component build --dev

components: component.json
	@component install --dev

template.js: template.html
	@component convert $<

clean:
	rm -fr build components $(STANDALONE_DIR)

test: build
	@npm install
	@testling

standalone: build
	@component build --standalone RealtimeBarGraph --out $(STANDALONE_DIR) --name realtime-bar-graph
	@uglifyjs $(STANDALONE_DIR)/realtime-bar-graph.js > $(STANDALONE_DIR)/realtime-bar-graph.min.js

.PHONY: clean test