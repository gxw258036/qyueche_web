module.exports =   "apps" : [{
    script: "index.js",
    watch: "."
  }, {
    script: "./service-worker/",
    watch: ["./service-worker"]
  }],

  "deploy" : {
    "production" : {
      "user" : "526585755@qq.com",
      "host" : "47.99.144.43",
      "ref"  : "origin/dev",
      "repo" : "https://github.com/gxw258036/qyueche_web.git",
      "path" : "/root/app/qyueche_web",
      "pre-deploy-local": "",
      "post-deploy" : "git pull origin dev && npm run build && pm2 restart all",
      "pre-setup": ""
    }
  }
};
