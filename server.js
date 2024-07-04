//declaração de constantes utilização das dependências necessárias
const mysql = require('mysql2');
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');

//constante que recebe todas as funções da dependência express
const app = express();

//todos os arquivos estáticos devem constar na pasta public
app.use(express.static('public'));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: function(req,file,cb){
        cb(null, Date.now() + '-' + file.originalname)
    }
})
const upload = multer({storage:storage});
app.use('/uploads', express.static('uploads'));

//armazena os dados da conexão
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'protimehub'
});

//cria a conexão e emite mensagem indicando seu status
connection.connect(function(err){
    if(err){
        console.error('Erro ', err);
        return
    }
    console.log("Conexão ok")
});

//bodyParser serve para capturar os dados do formulário html
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json())
app.use(express.urlencoded({extended: true}));


//rota para definir a página default
app.get("/", function(req, res){
    res.sendFile(__dirname + "/cadastro.html") 
});
app.get("/login", function(req, res){
    res.sendFile(__dirname + "/login.html") 
});
app.get("/login-erro", function(req, res){
    res.sendFile(__dirname + "/login-erro.html") 
});
app.get("/inicio", function(req, res){
    res.sendFile(__dirname + "/index.html") 
});
app.get("/cadastre", function(req, res){
    res.sendFile(__dirname + "/cadastro.html") 
});
app.get('/tarefas', (req, res) => {
    res.sendFile(__dirname + '/tarefas.html');
  });
  app.get('/notas', (req, res) => {
    res.sendFile(__dirname + '/nota.html');
  });

//rota para direcionar para realizar o login fazendo a verificar de usuário no banco
app.post('/logar', function(req, res) {
    const email = req.body.email;
    const senha = req.body.senha;

    connection.query('SELECT * FROM usuarios WHERE email = ? AND senha = ?', [email, senha], function(error, results, fields) {
        if (error) {
            console.error('Erro ao executar a consulta: ', error);
            res.status(500).send('Erro interno ao verificar credenciais.');
            return;
        }

        if (results.length > 0) {
            
            res.redirect('/inicio-erro');
        } else {
            res.redirect('/inicio');
            return;
        }
    });
});
// Rota para alterar a senha do usuário
app.post('/alterar-senha', function(req, res) {
    const email = req.body.email;
    const novaSenha = req.body.novaSenha;

    // Executa a instrução SQL para alterar a senha no banco de dados
    connection.query('UPDATE usuario SET senha = ? WHERE email = ?', [novaSenha, email], function(error, results, fields) {
        if (error) {
            console.error('Erro ao alterar a senha: ', error);
            res.status(500).send('Erro interno ao alterar a senha.');
            return;
        }

        if (results.affectedRows > 0) {
            res.status(200).send('Senha alterada com sucesso.');
        } else {
            res.status(404).send('Usuário não encontrado.');
        }
    });
});

app.post('/cadastrar',function(req,res){

    const nome = req.body.nome;
    const email = req.body.email;
    const senha = req.body.senha;  
    
    const values = [nome, email, senha]
    const insert = "INSERT INTO usuarios(nome, email, senha) VALUES (?, ?, ?)"

    connection.query(insert, values, function(err, result){
        if (!err){
        
            console.log("Dados inseridos com sucesso!");
            res.redirect('/login');
            
        } else {
            console.log("Não foi possível inserir os dados: ", err);
            res.send("Erro!",err)
        }
    })
})

app.post('/tarefas', function(req, res) {
    const titulo = req.body.titulo;
    const conteudo = req.body.conteudo;

    const values = [titulo, conteudo];
    const insert = "INSERT INTO Tarefas(titulo, conteudo) VALUES (?, ?)";

    connection.query(insert, values, function(err, result) {
        if (!err) {
            console.log("Dados de tarefa inseridos com sucesso!");
            res.status(200).json({ success: true });
        } else {
            console.log("Não foi possível inserir os dados da tarefa: ", err);
            res.status(500).json({ success: false, error: err });
        }
    });
});


app.post('/nota',function(req,res){

    const titulo = req.body.titulo;
    const conteudo = req.body.conteudo;
    
    const values = [titulo, conteudo]
    const insert = "INSERT INTO Notas(titulo, conteudo) VALUES (?, ?)"

    connection.query(insert, values, function(err, result){
        if (!err){
        
            console.log("Dados inseridos com sucesso!");
            res.redirect('/notas');
            
        } else {
            console.log("Não foi possível inserir os dados: ", err);
            res.send("Erro!",err)
        }
    })
})


//cria a função que "ouve" a porta do servidor
app.listen(8083, function(){
    console.log("Servidor rodando na url http://localhost:8083")
})
