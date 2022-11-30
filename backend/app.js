const express = require('express');
const morgan = require('morgan');
const app = express();
const bodyParser = require('body-parser');
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
const mysql = require("./mysql").pool;

app.use((req, res, next) => { //doesn't send response just adjusts it
  res.header("Access-Control-Allow-Origin", "*") //* to give access to any origin
  res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization" //to give access to all the headers provided
  );
  if(req.method === 'OPTIONS'){
      res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET'); //to give access to all the methods provided
      return res.status(200).json({});
  }
  next(); //so that other routes can take over
})

//logar no sistema
app.post('/logar',(req,res)=>{
   let result=[];
    const{email,senha}=req.body;
    mysql.getConnection((error,conn)=>{
     conn.query(
       `SELECT * FROM usuario WHERE email LIKE ? AND senha LIKE ?`,
        [email,senha],
       (error,resultado,field)=>{
         conn.release();
         if(error){
          return res.status(500).send({
             error:error,
             response:null
           })
         }
      
         if(resultado.length>0){
          resultado.map((linha)=>{
            result.push({
              id:linha.id,
              nome:linha.nome,
              email:linha.email
              })
          })
        
           return res.status(200).send({
              mensagem:"usuário logado",
              usuario:result
            })
          }else{
           return res.status(203).send({
              mensagem:"Dados Incorretos para Login",
              usuario:[]
            }) 
          }
         })
        }
       )
     });
    //salvar os favoritos
     app.post('/favoritar',(req,res)=>{
      const{idusuario,idproduto}=req.body;
      mysql.getConnection((error,conn)=>{
        conn.query("select count(*) as total from favorito WHERE produtoid=? and usuarioid=?",
        [idproduto,idusuario],
        (error,resultado, field)=>{
          conn.release();
          if(error){
            return res.status(500).send({
              error:error,
              response:null
            })
          }
       
          if(resultado[0].total>0){
            mysql.getConnection((error,conn)=>{
              conn.query("DELETE favorito WHERE usuarioid=? and produtoid",
              [idusuario,idproduto],
              (error,resultado, field)=>{
                conn.release();
                if(error){
                  return res.status(500).send({
                    error:error,
                    response:null
                  })
                }
              });
            })
          }else{
            mysql.getConnection((error,conn)=>{
              conn.query("INSERT INTO `favorito`(`usuarioid`, `produtoid`) value(?,?)",
              [idusuario,idproduto],
              (error,resultado, field)=>{
                conn.release();
                if(error){
                  return res.status(500).send({
                    error:error,
                    response:null
                  })
                }
                res.status(200).send({
                  mensagem:"Favorito Salvo com Sucesso!!!!",
                  favorito: resultado.insertId
                })
              }
              )
           });
          }
          
      });

    });
  });
// executar reações
app.post('/reagir',(req,res)=>{
    const{idusuario,idproduto,reacao}=req.body;
    
    mysql.getConnection((error,conn)=>{
      conn.query(
        `SELECT COUNT(*) as total FROM 
        reagir WHERE reagir.usuarioid=? 
        and reagir.produtoid=?`,
        [idusuario,idproduto],
        (error,resultado,field)=>{
          conn.release();
          if(error){
           return res.status(500).send({
              error:error,
              response:null
            })
          }
     
          if(resultado[0].total>0){
            return res.status(406).send({
              mensagem:"Reação duplicada!"
            })
          }
          mysql.getConnection((error,conn)=>{
            conn.query(
              "INSERT INTO `reagir`(`usuarioid`, `produtoid`, `reacao`) value(?,?,?)",
              [idusuario,idproduto,reacao],
              (error,resultado,field)=>{
                conn.release();
                if(error){
                 return res.status(500).send({
                    error:error,
                    response:null
                  })
                }
                mysql.getConnection((error,conn)=>{
                  conn.query(
                    "select count(*) as total from reacao where reacao=? and cursoid=?",
                    [reacao,idproduto],
                    (error,resultado,field)=>{
                      conn.release();
                      if(error){
                       return res.status(500).send({
                          error:error,
                          response:null
                        })
                      }
                      
                      res.status(200).send({
                        mensagem:"Dados da reação!!!!",
                        reacao:resultado[0].total
                      
                      })
                     }
                    )
                  })
               }
              )
            })
          
      })
     }
    )
});

// listar os produtos com a contagem de like e deslike
app.get('/produto',(req,res)=>{
      mysql.getConnection((error,conn)=>{
     conn.query(
       `SELECT id, nome,
       (SELECT count(id) FROM reagir where reagir.produtoid=produto.id and reagir.reacao=true) as "like",
       (SELECT count(id) FROM reagir where reagir.produtoid=produto.id and reagir.reacao=false) as "deslike",
       foto
       from produto `,
       (error,resultado,field)=>{
         conn.release();
         if(error){
          return res.status(500).send({
             error:error,
             response:null
           })
         }
          res.status(200).send({
           mensagem:"Dados do Produto!!!!",
           produto:resultado
         
         })
        }
       )
     })
});

//lista um determinado produto
app.get('/produto/:id',(req,res)=>{
    const id = req.params.id;
      mysql.getConnection((error,conn)=>{
     conn.query(
       `SELECT * FROM produto where id=${id}`,
       (error,resultado,field)=>{
         conn.release();
         if(error){
          return res.status(500).send({
             error:error,
             response:null
           })
         }
          res.status(200).send({
           mensagem:"Dados do Curso!!!!",
           curso:resultado
         
         })
        }
       )
     })
});
// buscar todos as reações 
app.get('/reagir/:id',(req,res)=>{
  const id = req.params.id;
  mysql.getConnection((error,conn)=>{
    conn.query(
      "SELECT * FROM `reagir` WHERE usuarioid=?",
      [id],
      (error,resultado,field)=>{
        conn.release();
        if(error){
          return res.status(500).send({
            error:error,
            response:null
          }
          )
        }
        res.status(200).send({
          mensagem:"Reações desse Usuário",
          reacoes:resultado
        })
      }
    )
  })
});
//lista de todos os favoritos
app.get('/favorito/:id',(req,res)=>{
  const id = req.params.id;
  mysql.getConnection((error,conn)=>{
    conn.query(
      `SELECT favorito.id, favorito.produtoid,produto.nome,produto.foto FROM favorito
       INNER JOIN produto ON favorito.produtoid=produto.id WHERE favorito.usuarioid=?`,
      [id],
      (error,resultado,field)=>{
        conn.release();
        if(error){
          return res.status(500).send({
            error:error,
            response:null
          }
          )
        }
        res.status(200).send({
          mensagem:"Favoritos desse Usuário",
          favoritos:resultado
        })
      }
    )
  })
});
// lista de usuários 
app.get('/',(req,res)=>{
    mysql.getConnection((error,conn)=>{
        conn.query(
          "SELECT * FROM `usuario` ",
          (error,resultado,field)=>{
            conn.release();
            if(error){
             return res.status(500).send({
                error:error,
                response:null
              })
            }
            let result=[];
            resultado.map(linha=>{
              result.push(
                {
                  id:linha.id,
                  nome:linha.nome,
                  email:linha.email
                }
              )
            });


       
            res.status(200).send({
              mensagem:"aqui é a lista de usuários!!!!",
              usuario:result
            
            })
          }
          )
     })  
})

module.exports = app