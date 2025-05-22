from fastapi.openapi.utils import get_openapi
from app.api_keys.dependencies.swagger_api_key import API_KEY_NAME

def add_api_key_security_schema(app):
    """
    Inject both API Key and Bearer Token security schemes into Swagger UI.
    """
    def custom_openapi():
        if app.openapi_schema:
            return app.openapi_schema

        openapi_schema = get_openapi(
            title=app.title,
            version=app.version,
            description=app.description,
            routes=app.routes,
        )

        # Declare both security schemes
        openapi_schema["components"]["securitySchemes"] = {
            "ApiKeyAuth": {
                "type": "apiKey",
                "in": "header",
                "name": API_KEY_NAME
            },
            "BearerAuth": {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT"
            }
        }

        # Apply both security schemes to all operations (or refine per route if needed)
        for path in openapi_schema["paths"].values():
            for operation in path.values():
                operation.setdefault("security", []).extend([
                    {"ApiKeyAuth": []},
                    {"BearerAuth": []}
                ])

        app.openapi_schema = openapi_schema
        return app.openapi_schema

    app.openapi = custom_openapi
