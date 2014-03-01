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

realtime-bar-graph.js: build
	@component build --standalone RealtimeBarGraph --out $(STANDALONE_DIR) --name realtime-bar-graph

realtime-bar-graph.min.js: realtime-bar-graph.js
	@uglifyjs $(STANDALONE_DIR)/$< > $(STANDALONE_DIR)/$@

.PHONY: clean test