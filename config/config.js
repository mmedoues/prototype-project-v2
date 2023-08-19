const config={
    production :{
        SECRET: process.env.SECRET,
        DATABASE: process.env.MONGODB_URI
    },
    default : {
        SECRET: 'mysecretkey',
        DATABASE: 'mongodb://test:test@ac-bbyio1h-shard-00-00.kg2ovul.mongodb.net:27017,ac-bbyio1h-shard-00-01.kg2ovul.mongodb.net:27017,ac-bbyio1h-shard-00-02.kg2ovul.mongodb.net:27017/?ssl=true&replicaSet=atlas-f6nxuy-shard-0&authSource=admin&retryWrites=true&w=majority'
    }
}


exports.get = function get(env){
    return config[env] || config.default
}