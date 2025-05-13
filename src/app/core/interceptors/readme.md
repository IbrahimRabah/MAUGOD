# Interceptors

Interceptors are the middleware layer in Angular and the middleware is a core non-functional requirement in any app.

Are used to intercept HTTP requests and responses globally within application. They provide a way to modify or handle HTTP traffic before it reaches the server or after it returns from the server.

# example
Authentication: Interceptors can be used to automatically attach authentication tokens to outgoing HTTP requests. This ensures that authentication headers are consistently added to every request without having to manually add them in each service.
