import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import authRouter from './src/routes/auth'
import vitalsRouter from './src/routes/vitals'
import profileRouter from './src/routes/profile'
import { PrismaClient} from '@prisma/client';
import cors from 'cors'
import jwt from 'jsonwebtoken'
import { uploadLogo } from './src/middlewares/uploadLogo';

import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'


dotenv.config();

const app: Express = express();
const port = process.env.PORT;

const dbClient = new PrismaClient()

app.use(cors())
app.use(express.static('public'))
app.use(express.json())

app.use('/logo', express.static("./uploaded-images/logo"))
app.use('/portfolio', express.static("./uploaded-images/portfolio"))

app.get('/', (req, res) => {
    res.send("Hello World!")
})

function authenticateUser (req:any, res:any , next: any) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) {
        console.log("token is Null!")
        return res.status(400)
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || 'defaultSecret', (err: any, user: any) => {
        if (err) return res.status(403)
        req.user = user
        next()
    })
}

//app.use('/api/v1/services', servicesRouter(dbClient, authenticateUser, uploadLogo))
app.use('/api/v1/auth', authRouter(dbClient, authenticateUser))
app.use('/api/v1/vitals', vitalsRouter(dbClient, authenticateUser))
app.use('/api/v1/profiles', profileRouter(dbClient, authenticateUser))

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "REST api for Health Records Documentation",
            version: "1.0.0"
        },
        schemes: ["http", "https"],
        servers: [
            {
                url: `${process.env.API_DOC_URL}:${port}`
            }
        ]
    },
    apis: ["./apis/*.ts"]
}
const spacs = swaggerJSDoc(options)
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(spacs)
)
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
