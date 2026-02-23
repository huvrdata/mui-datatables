module.exports = {
  "env": {
    "test": {
      "presets": [
        [
          "@babel/preset-env",
          {
            "targets": {
              "node": "current"
            },
            "modules": "commonjs",
            "useBuiltIns": "entry",
            "corejs": {
              "version": 3,
              "proposals": true
            }
          }
        ],
        "@babel/preset-react"
      ],
      "plugins": []
    }
  },
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          "browsers": [
            "> 0.5%",
            "not dead"
          ],
          "node": "18"
        },
        "useBuiltIns": "entry",
        "debug": false,
        "modules": false,
        "corejs": {
          "version": 3,
          "proposals": true
        }
      }
    ],
    [
      "@babel/preset-react"
    ]
  ],
  "plugins": [
    [
      "@babel/plugin-transform-class-properties"
    ],
    [
      "@babel/plugin-transform-object-rest-spread"
    ],
    [
      "@babel/plugin-transform-runtime",
      {
        "corejs": 3,
        "regenerator": true
      }
    ]
  ]
}
