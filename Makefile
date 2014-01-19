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
	@mocha-phantomjs -R dot test/index.html

realtime-bar-graph.js: build
	@component build --standalone RealtimeBarGraph --out $(STANDALONE_DIR) --name realtime-bar-graph

realtime-bar-graph.min.js: realtime-bar-graph.js
	@uglifyjs $(STANDALONE_DIR)/$< > $(STANDALONE_DIR)/$@

stats: $(STANDALONE_DIR)/realtime-bar-graph.js $(STANDALONE_DIR)/realtime-bar-graph.min.js
	@du -h $^

.PHONY: clean test stats