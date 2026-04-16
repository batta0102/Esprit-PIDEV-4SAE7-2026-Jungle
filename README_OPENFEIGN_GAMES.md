# OpenFeign in Games Service

This file explains exactly how OpenFeign works for the game backend integration.

## What OpenFeign is

OpenFeign lets you call another microservice using a Java interface instead of manually writing HTTP code.

Instead of using `RestTemplate` or raw HTTP logic, you define methods and annotations. Spring creates a runtime client for you.

## Typical setup used in games backend

1. Add dependency:
   - `spring-cloud-starter-openfeign`

2. Enable Feign in the main application:
   - `@EnableFeignClients`

3. Create a client interface:
   - `@FeignClient(name = "user-service", path = "/api/users")`

4. Declare endpoint methods:
   - `@GetMapping("/health")`
   - `Map<String, Object> health();`

## Exact runtime flow

1. Request reaches game backend endpoint (for example an integration/probe endpoint).
2. Controller or service calls `userServiceClient.health()`.
3. Feign builds an HTTP request from annotations.
4. Service name `user-service` is resolved via Spring Cloud discovery/load balancing (with Eureka if configured).
5. Request is sent to `/api/users/health` on user-service.
6. JSON response is converted to Java type and returned.
7. If downstream service fails, Feign throws an exception that your code can catch and map to a friendly error response.

## Why this is useful

- Less boilerplate code
- Cleaner and typed inter-service communication
- Easy integration with service discovery
- Better maintainability in microservices architecture
