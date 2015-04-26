var gameApp = angular.module("gameApp", ["ngRoute", "appControllers"]);

gameApp.config(["$routeProvider",
    function($routeProvider) {
        $routeProvider.
            when('/login/:modeType', {
                templateUrl: "partials/login.html",
                controller: "LoginController"
            }).
            when('/register/:modeType/:imageId', {
                templateUrl: "partials/register.html",
                controller: "RegisterController"
            }).
            when('/register/:modeType', {
                templateUrl: "partials/register.html",
                controller: "RegisterController"
            }).
            when('/game/:modeType/:imageId', {
                templateUrl: "partials/game.text.html",
                controller: "GameController"
            }).
            when('/game/:modeType', {
                templateUrl: "partials/game.text.html",
                controller: "GameController"
            }).
            when('/heatmap', {
                templateUrl: "partials/heatmap.html",
                controller: "HeatmapController"
            }).
            otherwise({
                redirectTo: "/login/tweet"
            });
    }
]);
