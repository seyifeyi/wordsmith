var gameApp = angular.module("gameApp", ["ngRoute", "appControllers"]);

gameApp.config(["$routeProvider",
    function($routeProvider) {
        $routeProvider.
            when('/login', {
                templateUrl: "partials/login.html",
                controller: "LoginController"
            }).
            when('/register/:imageId', {
                templateUrl: "partials/register.html",
                controller: "RegisterController"
            }).
            when('/register', {
                templateUrl: "partials/register.html",
                controller: "RegisterController"
            }).
            when('/game/:imageId', {
                templateUrl: "partials/game.html",
                controller: "GameController"
            }).
            when('/game', {
                templateUrl: "partials/game.html",
                controller: "GameController"
            }).
            otherwise({
                redirectTo: "/login"
            });
    }
]);
