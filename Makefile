.PHONY: dev demo reset

dev:
	docker-compose up -d
	npm run dev

demo:
	@echo "Preloading detective fragments..."
	curl -X POST http://localhost:3000/api/preload-detective

reset:
	@echo "Resetting all Cognee datasets..."
	docker-compose down -v
	docker-compose up -d
