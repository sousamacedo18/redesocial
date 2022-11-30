

$(document).ready(function(){

    montarProdutos();
   montarFavoritos();
  

    reacaoProdutoLike=async(id)=>{
    
    const usuario = JSON.parse(sessionStorage.getItem("login")||0);

     if(usuario!==0){
     
                  const _data={
                    idusuario:usuario[0].id,
                    idproduto:id,
                    reacao:1
                          }
                          console.log(_data);
                    const url = "http://localhost:5000/reagir";
                    const response = await fetch(url,
                    {
                      method: "POST",
                      headers:{
                            "Content-type":"application/json",
                              },
                      body:JSON.stringify(_data)
                    }
                    )
                    .then((response)=> response.json())
                    .then((data)=>{
                    
                      $("#like"+id).html(data.reacao);
                    }
                    );
                    montarProdutos();
                    }else{
                              alert("você precisa logar no sistema");
                    }
    }
    reacaoProdutoDeslike=async(id)=>{
      const usuario = JSON.parse(sessionStorage.getItem("login")||0);
      if(usuario!==0){
                        const _data={
                          idusuario:usuario[0].id,
                          idproduto:id,
                          reacao:0
                        }
                const url = "http://localhost:5000/reagir";
                const response = await fetch(url,
                  {
                    method: "POST",
                    headers:{
                          "Content-type":"application/json",
                            },
                    body:JSON.stringify(_data)
                  }
                  )
                  .then((response)=> response.json())
                  .then((data)=>{
                    
                    $("#deslike"+id).html(data.reacao);
                  }
                  );
                   montarProdutos();
                }else{
                  alert("você precisa logar no sistema");
         }
    }
  
   async function montarFavoritos(){
     
      const usuario = JSON.parse(sessionStorage.getItem("login")||0);
      if(usuario!==0){
      let htmlcentro="";
      const id=usuario[0].id;
    

      const url = "http://localhost:5000/favorito/"+id;
      const response = await fetch(url,
        {
          method: "GET",
          headers:{
                "Content-type":"application/json",
                   },
           
        }
        )
        .then((response)=> response.json())
        .then((data)=>{
     
          const produto= data.favoritos;   
                 
          for(var i=0; i < produto.length;i++){
          htmlcentro+="<div class='card'>"
          htmlcentro+="<img src='./img/mecanico.jpg'>"
          htmlcentro+="<div class='reacao'>"
          htmlcentro+="<div>"
          htmlcentro+="<label>"+produto[i].nome+"</label>"
          htmlcentro+="</div>"
          htmlcentro+="<div>"
          if(reagiuaoProduto(produto[i].id,1)){
          htmlcentro+= "<i class='bi bi-hand-thumbs-up-fill' ></i>"
          }else{
          htmlcentro+="<i class='bi bi-hand-thumbs-up' onclick='reacaoProdutoLike("+produto[i].id+")'></i>"
          }
          htmlcentro+="<label id='like"+produto[i].id+"'>"+produto[i].like+"</label>"
          if(reagiuaoProduto(produto[i].id,0)){
            htmlcentro+= "<i class='bi bi-hand-thumbs-down-fill' ></i>"
          }else{
          htmlcentro+=" <i class='bi bi-hand-thumbs-down' onclick='reacaoProdutoDeslike("+produto[i].id+")'></i>"
          }
          htmlcentro+="<label id='deslike"+produto[i].id+"'>"+produto[i].deslike+"</label>"
          if(efavorito(produto[i].id)){
            htmlcentro+="<i onClick='favoritar("+produto[i].id+")' class='bi bi-heart-fill'></i>"
          }else{
            htmlcentro+="<i onClick='favoritar("+produto[i].id+")' class='bi bi-heart'></i>"
          }
          htmlcentro+="</div>"
          htmlcentro+="</div>"
          htmlcentro+="</div>"
        }
      });
          $("#favoritos").html(htmlcentro);


        }
  
    }


    favoritar =async(idproduto) =>{
  
      const usuario = JSON.parse(sessionStorage.getItem("login")||0);

       if(usuario!==0){
              const _data={
                idproduto:idproduto,
                idusuario:usuario[0].id
              }
              console.log(_data)
              const url = "http://localhost:5000/favoritar/";
              const response = await fetch(url,
                {
                  method: "POST",
                  headers:{
                        "Content-type":"application/json",
                          },
                body:JSON.stringify(_data)
                }
                )
                .then((response)=> response.json())
                .then((data)=>{
                    
                    return data
                })
              }else{
                alert("Você precisa logar no sistema")
              }
    }
   verificarReacoes=async(id)=>{
      const url = "http://localhost:5000/reacao/"+id;
      const response = await fetch(url,
        {
          method: "GET",
          headers:{
                "Content-type":"application/json",
                   },
           
        }
        )
        .then((response)=> response.json())
        .then((data)=>{
            
            return data.reacoes
        })
  
    }
   async function montarProdutos(){
    let reacao=[];
    let favorito=[];
    let htmltopo = "";
    let htmlcentro = "";
    let htmlrodape = "";
  
    const usuario = JSON.parse(sessionStorage.getItem("login")||0);
    let idusu=0;

    if(usuario!==0){
        idusu=usuario[0].id;
       
        const url_favorito = "http://localhost:5000/favorito/"+idusu;
        const url_reacao = "http://localhost:5000/reagir/"+idusu;
                          //aqui faremos as consultas de reacao do usuário logado
                    const resp_reacao = await fetch(url_reacao,
                      {
                        method: "GET",
                        headers:{
                              "Content-type":"application/json",
                                },
                        
                      }
                      )
                      .then((resp_reacao)=> resp_reacao.json())
                      .then((data)=>{
                            reacao=data.reacoes;
                      });
                  
                      //consulta todos os favoritos
  
                      const resp_favorito = await fetch(url_favorito,
                        {
                          method: "GET",
                          headers:{
                                "Content-type":"application/json",
                                  },
                          
                        }
                        )
                        .then((resp_favorito)=> resp_favorito.json())
                        .then((data)=>{
                              favorito=data.favoritos;
                        });
    }
  
    reagiuaoProduto=(idproduto,idfeedback )=>{
      if(usuario!==0){
        const id = usuario[0].id;
        const reagiu = reacao.filter((item)=>item.usuarioid==id && item.produtoid==idproduto && item.reacao==idfeedback);
         
        if(reagiu.length>0){
          return true;
        }
      }
      return false;
    }
    efavorito=(idproduto)=>{
      if(usuario!==0){
        const id = usuario[0].id;
        const favoritou = favorito.filter((item)=>item.usuarioid==id && item.produtoid==idproduto);
         
        if(favoritou.length>0){
          
          return true;
        }
      }
      return false;
    }
    const url = "http://localhost:5000/produto";
  
        //aqui faremos as consultas dos cursos
      const response = await fetch(url,
        {
          method: "GET",
          headers:{
                "Content-type":"application/json",
                   },
           
        }
        )
        .then((response)=> response.json())
        .then((data)=>{
       
          const produto= data.produto;   
                 
          for(var i=0; i < produto.length;i++){
        
                if(i<=1){
                    //console.log(filtrarReacao(cursos[i].id))
                    htmltopo+="<div class='card' >"
                    htmltopo+="<img  src='./img/mecanico.jpg'>"
                    htmltopo+="<div class='reacao'>"
                    htmltopo+= "<div>"
                    htmltopo+= "<label>"+produto[i].nome+"</label>"
                    htmltopo+= "</div>"
                    htmltopo+="<div>"
                    if(reagiuaoProduto(produto[i].id,1)){
                      htmltopo+= "<i class='bi bi-hand-thumbs-up-fill' ></i>"
                    }else{
                      htmltopo+= "<i class='bi bi-hand-thumbs-up' onclick='reacaoProdutoLike("+produto[i].id+")'></i>"
                    }
                    
                    htmltopo+="<label id='like"+produto[i].id+"'>"+produto[i].like+"</label>"
                    if(reagiuaoProduto(produto[i].id,0)){
                      htmltopo+= "<i class='bi bi-hand-thumbs-down-fill' ></i>"
                    }else{
                    htmltopo+="<i class='bi bi-hand-thumbs-down' onclick='reacaoProdutoDeslike("+produto[i].id+")'></i>"
                    }
                    htmltopo+="<label id='deslike"+produto[i].id+"'>"+produto[i].deslike+"</label>"
                    if(efavorito(produto[i].id)){
                      htmltopo+="<i onClick='favoritar("+produto[i].id+")' class='bi bi-heart-fill'></i>"
                    }else{
                      htmltopo+="<i onClick='favoritar("+produto[i].id+")' class='bi bi-heart'></i>"
                    }
                    
                    htmltopo+="</div>"
                    htmltopo+= "</div>"
                    htmltopo+= "</div>"
  
                  
                }
              if(i>1 && i<=5){
               
                      htmlcentro+="<div class='card'>"
                      htmlcentro+="<img src='./img/mecanico.jpg'>"
                      htmlcentro+="<div class='reacao'>"
                      htmlcentro+="<div>"
                      htmlcentro+="<label>"+produto[i].nome+"</label>"
                      htmlcentro+="</div>"
                      htmlcentro+="<div>"
                      if(reagiuaoProduto(produto[i].id,1)){
                      htmlcentro+= "<i class='bi bi-hand-thumbs-up-fill' ></i>"
                      }else{
                      htmlcentro+="<i class='bi bi-hand-thumbs-up' onclick='reacaoProdutoLike("+produto[i].id+")'></i>"
                      }
                      htmlcentro+="<label id='like"+produto[i].id+"'>"+produto[i].like+"</label>"
                      if(reagiuaoProduto(produto[i].id,0)){
                        htmlcentro+= "<i class='bi bi-hand-thumbs-down-fill' ></i>"
                      }else{
                      htmlcentro+=" <i class='bi bi-hand-thumbs-down' onclick='reacaoProdutoDeslike("+produto[i].id+")'></i>"
                      }
                      htmlcentro+="<label id='deslike"+produto[i].id+"'>"+produto[i].deslike+"</label>"
                      if(efavorito(produto[i].id)){
                        htmlcentro+="<i onClick='favoritar("+produto[i].id+")' class='bi bi-heart-fill'></i>"
                      }else{
                        htmlcentro+="<i onClick='favoritar("+produto[i].id+")' class='bi bi-heart'></i>"
                      }
                      htmlcentro+="</div>"
                      htmlcentro+="</div>"
                      htmlcentro+="</div>"

                       }
              if(i>5 && i<=8){
                
                          htmlrodape+="<div class='card'>"
                          htmlrodape+="<img src='./img/mecanico.jpg'>"
                          htmlrodape+="<div class='reacao'>"
                          htmlrodape+="<div>"
                          htmlrodape+="<label>"+produto[i].nome+"</label>"
                          htmlrodape+="</div>"
                          htmlrodape+="<div>"
                          if(reagiuaoProduto(produto[i].id,1)){
                            htmlrodape+= "<i class='bi bi-hand-thumbs-up-fill' ></i>"
                            }else{
                          htmlrodape+="<i class='bi bi-hand-thumbs-up'onclick='reacaoProdutoLike("+produto[i].id+")'></i>"
                          }
                          htmlrodape+="<label id='like"+produto[i].id+"'>"+produto[i].like+"</label>"
                          if(reagiuaoProduto(produto[i].id,0)){
                            htmlrodape+= "<i class='bi bi-hand-thumbs-down-fill' ></i>"
                          }else{                       
                          htmlrodape+=" <i class='bi bi-hand-thumbs-down' onclick='reacaoProdutoDeslike("+produto[i].id+")'></i>"
                          }
                          htmlrodape+="<label id='deslike"+produto[i].id+"'>"+produto[i].deslike+"</label>"
                          if(efavorito(produto[i].id)){
                            htmlrodape+="<i onClick='favoritar("+produto[i].id+")' class='bi bi-heart-fill'></i>"
                          }else{
                            htmlrodape+="<i onClick='favoritar("+produto[i].id+")' class='bi bi-heart'></i>"
                          }
                          htmlrodape+="</div>"
                          htmlrodape+="</div>"
                          htmlrodape+="</div>"               
                
              }
                              if(i==9){
                                i=0;
                              }
              }
                                
                                 $(".destaque-topo").html(htmltopo)
                                 $(".destaque-centro").html(htmlcentro)
                                 $(".destaque-rodape").html(htmlrodape)
                                 
      
  
        })
  
        
  }
  
  async function logar(){
     const logado = JSON.parse(sessionStorage.getItem('login')||0);
     const email=document.getElementById("email").value;
     const senha=document.getElementById("senha").value;
     
    
      const url = "http://localhost:5000/logar";
      const _data={
        email:email,
        senha:senha
      }
    
       const response = await fetch(url,
        {
          method: "POST",
          headers:{
            "Content-type":"application/json",
          },
          body:JSON.stringify(_data)
        }
       )
           .then((response) => response.json())
      
           .then((data) => {
                     if(data.usuario.length==0){
                      alert("Usuário ou senha incorretos!!!!")
                     }else{
                      $("#exampleModal").modal("hide");
                      sessionStorage.setItem("login",JSON.stringify(data.usuario));
                      const usuario=JSON.parse(sessionStorage.getItem('login')||0);
                      const nome = usuario[0].nome;
                      const id = usuario[0].id;
                      window.location.reload();
                     // $("#log-in").html("<h6>Usuário:"+ nome+ "</h6>");
                      
                     }
                 
                })
                .catch((error) => {
                console.error('Error:', error);
                });
  }
  $('#acesso').click(function(){
    $('#exampleModal').modal('show')
  });
  
  $('#btn-logar').click(function(){
      logar();
  })
  $(function(){
    montarProdutos();
  const usuario=JSON.parse(sessionStorage.getItem('login')||0);
  if(usuario!==0){
     const id= usuario[0].id;
     const nome = usuario[0].nome;
     $("#log-in").append("<h6>Usuário: "+nome+"</h6>");
     $("#id").val(id);
     return id;
  }else{
  
   return 0;
  }
  })
  });
  
  