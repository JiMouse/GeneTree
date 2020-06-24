//Create JSON dictionnary
var dico = {
    'pronom':{
        'M':'Il',
        'F':'Elle',
        'MM':'Ils',
        'Mmes':'Elles'
    },
    'pronom2':{
        'M':'Son',
        'F':'Sa'
    },
    'civil':{
        'M':'Monsieur',
        'F':'Madame',
        'MM':'Messieurs',
        'Mmes':'Mesdames'
    },
    'naissance':{
        'M':'né en',
        'F':'née en',
        'MM':'nés en',
        'Mmes':'nées en'
    },
    'décés':{
        'M':'décédé',
        'F':'décédée'
    },
    'etre':{
        'vie':'est',
        'décés':'était'
    },
    'issu':{
        'M':'issu',
        'F':'issue'
    },
}

function getPatho(obj, i) {
  var patho = []
  var age = []
  var keys = Object.keys(obj[i])
  
  for (var j = 0; j < keys.length; j++) {
      if (keys[j].indexOf("_diagnosis_age") !== -1) {
          var out = keys[j].substring(0, keys[j].length - 14)
          patho.push(out);
          age.push(obj[i][keys[j]]);
      }
  }
  result = {
    "Disease1":patho[0],
    "Age1":age[0],
    "Disease2":patho[1],
    "Age2":age[1],
    "Disease3":patho[2],
    "Age3":age[2]
  }
  return result
}

function histoire(obj) {
    // index
    var text
    for (var i = 0; i < obj.length; i++) {
        if (obj[i].proband == true) {

            text = textIndex(obj, i)

        } else {
            //fratrie
        }
    }
    return 'Fonctionnalité non implémentée.' // text //
}

function textIndex(obj, i){ //pour le cas index
    // Deux élements : motif de consultation et enfant & conjoint
    let result = {'index':'', 'couple':''}
    let indexData = obj[i],
    sex = indexData.sex;
    status = (indexData.hasOwnProperty('status') ? 'décés' : 'vie')
    
    // check disease
    d1 = getPatho(obj, i).Disease1
    

    //{"proband":true,"famid":"1","display_name":"Index","name":"1","father":"2","mother":"3","sex":"M","yob":"","age":""}
    result.index = dico.civil[sex] + ' ' + dico.etre[status]  + ' ' + dico.naissance[sex] + ' ' + indexData.yob +' ('+indexData.age+'ans).'
    //result.index += "Madame , née en , se présente en consultation de génétique pour évaluation d'une éventuelle prédisposition familiale."
    result.index += 'Elle ne présente pas, au jour de la consultation, de pathologie cancéreuse.'

    return  result.index
}

function textline(obj, i){ //pour les autres individus (fratrie, parents)
    //
}

/*
//Expected output
Madame , née en , se présente en consultation de génétique pour évaluation d'une éventuelle prédisposition familiale. Elle ne présente pas, au jour de la consultation, de pathologie cancéreuse.

Elle est née en NA, toujours en vie. Elle est enfant unique.
Son père est né en NA, toujours en vie. Il est enfant unique.
Sa mère est née en NA, toujours en vie. Elle est enfant unique.
Son grand-père paternel est né en NA, toujours en vie. Il est issu d'une fratrie de ?.
Sa grand-mère paternelle est née en NA, toujours en vie. Elle est issue d'une fratrie de ?.
Son grand-père maternel est né en NA, toujours en vie. Il est issu d'une fratrie de ?.
Sa grand-mère maternelle est née en NA, toujours en vie. Elle est issue d'une fratrie de ?

Elle n'a pas d'enfant.
Elle n'a pas de conjoint.
*/

/*
// to adapt from R

 ## Plot text
  ## build dictionnary
  pronom <- c("Il", "Elle", "Ils", "Elles")
  civil <- c("Monsieur", "Madame", "Messieurs", "Mesdames")
  naissance <- c("nÃ© en", "nÃ©e en", "nÃ©s en", "nÃ©es en")
  M=1 ; F=2 ; MM = 3 ; Mmes = 4
  
  deces <- list(c("", ", dÃ©cÃ©dÃ©, "), c("", ", dÃ©cÃ©dÃ©e, "))
  etre <- c("est", "Ã©tait")
  issu <- c("issu", "issue")
  
  tag <- c("Index", "Son pÃ¨re","Sa mÃ¨re", "Son grand-pÃ¨re paternel", "Sa grand-mÃ¨re paternelle", "Son grand-pÃ¨re maternel", "Sa grand-mÃ¨re maternelle")
  
  motif <- paste("se prÃ©sente en consultation de gÃ©nÃ©tique"
                 #, "oncologique"
                 , "pour Ã©valuation d'une Ã©ventuelle prÃ©disposition familiale")
  
  motif.onco <- c("cancer du sein"
                  , "cancer du sein bilatÃ©ral"
                  , "cancer de l'ovaire"
                  , "cancer de la prostate"
                  , "cancer du pancrÃ©as"
                  , "cancer du colon")
  
  motif.onco.1 <- paste0("d'un ", motif.onco)
  
  surveillance <- c("n'a pas de surveillance spÃ©cifique", "n'a pas de surveillance coloscopique")
  
  cancer.neg.index <- c("ne prÃ©sente pas, au jour de la consultation, de pathologie cancÃ©reuse.","")
  cancer.neg <- list(c("ne prÃ©sente pas de pathologie cancÃ©reuse.",""), c("n'a pas prÃ©sentÃ© de pathologie cancÃ©reuse.",""))
  
  conclusion <- c("En fonction des donnÃ©es cliniques, je propose...")
  
  year <- strsplit(as.character(Sys.Date()), "-")[[1]][1]
  
  ## build general functions
  # generate cancer.list : col number of cancer
  cancer.list <- function(x = cas) grep(x = as.numeric(x[13:17] != 0), pattern = 1)
  
  # generate cancer text : 
  cancer <- function(x=cancer.list(x=cas), cancer.col=cas[13:17], add="")
  {
    # req cancer.list
    cancer.age = cancer.col[x]
    cancer.year = as.numeric(year) - cancer.age
    paste0(add, motif.onco[x]," diagnostiquÃ© en ",cancer.year, " Ã   l'Ã¢ge de ", cancer.age, " ans", collapse = " et ")
  }
  
  # generate index text
  index_text <- function(dataframe, Id=1)
  {
    cas <- dataframe[dataframe[5]==Id,]
    
    cas.name = cas[[3]]
    cas.yob = cas[[11]]
    cas.pere = cas[[6]]
    cas.mere = cas[[7]]
    cas.sex = as.numeric(cas[[8]]=="F")+1
    cas.dcd = cas[[12]] + 1
    
    cas.text = paste(paste0(civil[cas.sex], " ", cas.name, ", ")
                     , naissance[cas.sex], " "
                     , cas.yob, ", " 
                     , deces[[cas.sex]][cas.dcd]
                     , motif
                     , ifelse (length(cancer.list(x = cas)) == 0
                               , paste0(". ", pronom[cas.sex]," ", cancer.neg.index[1])
                               , paste0(" dans le cadre ", cancer(x=cancer.list(x = cas), cancer.col=cas[13:17], add = "d'un "))
                     )
                     , sep= "")
    
    cas.text
  }
  
  # "est"/"Ã©tait" nÃ© en x, "toujours en vie"/"dÃ©cÃ©dÃ© Ã   [x] ans"
  cas_yob <- function(dataframe, Id)
  {
    cas = dataframe[dataframe[5]==Id,]
    
    cas.sex = as.numeric(cas[8]=="F")+1
    cas.dcd = as.numeric(cas[12]) + 1
    cas.name = cas[3]
    cas.yob = as.numeric(cas[11])
    cas.endage = as.numeric(cas[10])
    cas.yend = cas.yob + cas.endage
    deces.2 <- list(c("toujours en vie", paste0("dÃ©cÃ©dÃ© en ", cas.yend, " Ã   l'Ã¢ge de ", cas.endage, " ans"))
                    , c("toujours en vie", paste0("dÃ©cÃ©dÃ©e en ", cas.yend, " Ã   l'Ã¢ge de ", cas.endage, " ans")))
    
    cas.text = paste(naissance[cas.sex], " "
                     , cas.yob, ", " 
                    , deces.2[[cas.sex]][cas.dcd]
                    , sep= "")
    
    cas.text 
  }
  
  cas_yob_2 <- function(dataframe, Id)
  {
    cas = dataframe[dataframe[5]==Id,]
    
    cas.sex = as.numeric(cas[8]=="F")+1
    cas.dcd = as.numeric(cas[12]) + 1
    cas.name = cas[3]
    cas.yob = as.numeric(cas[11])
    cas.endage = as.numeric(cas[10])
    cas.yend = cas.yob + cas.endage
    deces.2 <- list(c("", paste0(", dÃ©cÃ©dÃ© en ", cas.yend, " Ã   l'Ã¢ge de ", cas.endage, " ans"))
                    , c("", paste0(", dÃ©cÃ©dÃ©e en ", cas.yend, " Ã   l'Ã¢ge de ", cas.endage, " ans")))
    
    ifelse(is.na(cas.sex), cas.text <- "", {
      cas.text = paste(" ", naissance[cas.sex], " "
                       , cas.yob 
                       , deces.2[[cas.sex]][cas.dcd]
                       , sep= "")})
    
    cas.text 
  }
  
  # ""/"qui a prÃ©sentÃ© un" 
  cas_cancer <- function(dataframe, Id)
  {
    cas <- dataframe[dataframe[5]==Id,]
    #(cas.text <- c("blaba"))
    paste0(ifelse(length(cancer.list(x = cas)) != 0, paste0(", qui a prÃ©sentÃ© ", cancer(x=cancer.list(x=cas), cancer.col=cas[13:17], add="un ")), ""))
  }
  
  # "Enfant unique"/"Fratrie de [x]
  cas_frat <- function(frat=fratrie, data.id=cas)
  {
    cas.parents = data.id[6:7]
    cas.sex = as.numeric(data.id[[8]]=="F")+1
    
    if (sum(cas.parents) != 0) {
      
      cas.text = paste0(ifelse(nrow(frat)==0, paste0("est enfant unique"), paste0("est ", issu[cas.sex], " d'une fratrie de ", nrow(frat)+1, ".")))
    }
    
    else cas.text <- paste0("est ", issu[cas.sex]," d'une fratrie de ?")
    
    cas.text
    
  }
  
  # enfants
  cas_siblings <- function(dataframe, Id)
  {
    colnames(dataframe)[2] <- "tag"
    cas = dataframe[dataframe[5]==Id,]
    
    cas.sex = as.numeric(cas[[8]]=="F")
    cas.enfants = dataframe[dataframe[,6+cas.sex] == Id,]

    if (nrow(cas.enfants)!=0) {
      
      # NA
      cas.enfants[cas.enfants[8] != "M" & cas.enfants[8] != "F", 8] <- "NC"
      if(nrow(cas.enfants[cas.enfants[8] == "NC",])!=0)
      {cas.enfants[cas.enfants[8] == "NC",]$tag <- "un enfant"}
      
      # fils
      if(nrow(cas.enfants[cas.enfants[8] == "M",])!=0)
      {cas.enfants[cas.enfants[8] == "M",]$tag <- "un fils"}
      
      # fille
      if(nrow(cas.enfants[cas.enfants[8] == "F",])!=0)
      {cas.enfants[cas.enfants[8] == "F",]$tag <- "une fille"}
      
    }
    
    ifelse(nrow(cas.enfants)!=0, 
           {
             cas_yob.test <- sapply(cas.enfants[,5], function(i) cas_yob_2(dataframe, Id=i))
             cas_cancer.test <- sapply(cas.enfants[,5], function(i) cas_cancer(dataframe, Id=i))
             
             cas.text2 <- paste0(cas.enfants$tag
                                 , cas_yob.test
                                 , cas_cancer.test
                                 , collapse=", " )
           }
           , cas.text2 <- "pas d'enfant")
    
    cas.text <- paste0("(", cas.text2, ")")
    
    
    
    cas.text
    
  }
  
  # enfants
  cas_siblings_2 <- function(dataframe, Id)
  {
    colnames(dataframe)[2] <- "tag"
    cas = dataframe[dataframe[5]==Id,]
    
    cas.sex.2 = as.numeric(cas[[8]]=="F")+1 # 1 if "M", 2 if "F"
    cas.sex = as.numeric(cas[[8]]=="F")
    cas.enfants = dataframe[dataframe[,6+cas.sex] == Id,]
    
    if (nrow(cas.enfants)!=0) {
      
      # NA
      cas.enfants[cas.enfants[8] != "M" & cas.enfants[8] != "F", 8] <- "NC"
      if(nrow(cas.enfants[cas.enfants[8] == "NC",])!=0)
      {cas.enfants[cas.enfants[8] == "NC",]$tag <- "un enfant"}
      
      # fils
      if(nrow(cas.enfants[cas.enfants[8] == "M",])!=0)
      {cas.enfants[cas.enfants[8] == "M",]$tag <- "un fils"}
      
      # fille
      if(nrow(cas.enfants[cas.enfants[8] == "F",])!=0)
      {cas.enfants[cas.enfants[8] == "F",]$tag <- "une fille"}
      
    }
    
    ifelse(nrow(cas.enfants)!=0, 
           {
             cas_yob.test <- sapply(cas.enfants[,5], function(i) cas_yob_2(dataframe, Id=i))
             cas_cancer.test <- sapply(cas.enfants[,5], function(i) cas_cancer(dataframe, Id=i))
             
             cas.text2 <- paste0(cas.enfants$tag
                                 , cas_yob.test
                                 , cas_cancer.test
                                 , collapse=", " )
             cas.text2 <- paste0(pronom[cas.sex.2], " a ", cas.text2)
           }
           , cas.text2 <- paste0(pronom[cas.sex.2], " n'a pas d'enfant"))
  
    # capitalize first letter
    s <- toupper(strsplit(cas.text2, "")[[1]][1])
    cas.text <- paste0(s, substring(cas.text2, 2),".")
    
    cas.text
    
  }
  
  # "FrÃ¨re" / " Soeur" [#] / demi frÃ¨re / demi soeur puis fonction cas_yob, cas_cancer, cas_siblings
  cas_tag <- function(dataframe, Id)
  {
    colnames(dataframe)[2] <- "tag"
    colnames(dataframe)[8] <- "sex"
    cas = dataframe[dataframe[5]==Id,]
    
    cas.sex = as.numeric(cas[[8]]=="F")+1
    cas.dcd = cas[[12]] + 1
    cas.pere = cas[[6]]
    cas.mere = cas[[7]]
    cas.parents = cas[6:7]
    
    ## define complete fratrie including half brothers and sisters
    fratrie_comp <- dataframe[(dataframe[6] == cas.pere | dataframe[7] == cas.mere) & dataframe[5]!=Id,]
    
    ## define fratrie
    fratrie <- dataframe[dataframe[6] == cas.pere & dataframe[7] == cas.mere & dataframe[5]!=Id,]
    
    if (nrow(fratrie_comp)!=0) {
      ## define tags
      # frÃ¨re
      if(nrow(fratrie_comp[fratrie_comp[6] == cas.pere & fratrie_comp[7] == cas.mere & fratrie_comp$sex=="M",])!=0)
      {fratrie_comp[fratrie_comp[6] == cas.pere & fratrie_comp[7] == cas.mere & fratrie_comp$sex=="M",]$tag <- "un frÃ¨re"}
      
      # soeur
      if(nrow(fratrie_comp[fratrie_comp[6] == cas.pere & fratrie_comp[7] == cas.mere & fratrie_comp$sex=="F",])!=0)
      {fratrie_comp[fratrie_comp[6] == cas.pere & fratrie_comp[7] == cas.mere & fratrie_comp$sex=="F",]$tag <- "une soeur"}
      
      # => faire la diffÃ©rence avec enfants => 2nd ID doit Ãªtre diffÃ©rent du Id conjoint..
      
      # demi frere de pere
      #if(nrow(fratrie_comp[fratrie_comp[6] == cas.pere & fratrie_comp[7] != cas.mere & fratrie_comp$sex=="M",])!=0)
      #{fratrie_comp[fratrie_comp[6] == cas.pere & fratrie_comp[7] != cas.mere & fratrie_comp$sex=="M",]$tag <- "un frÃ¨re de pÃ¨re"}
      
      # demi frere de mere
      #if(nrow(fratrie_comp[fratrie_comp[6] != cas.pere & fratrie_comp[7] == cas.mere & fratrie_comp$sex=="M",])!=0)
      #{fratrie_comp[fratrie_comp[6] != cas.pere & fratrie_comp[7] == cas.mere & fratrie_comp$sex=="M",]$tag <- "un frÃ¨re de mÃ¨re"}
      
      # demi soeur de pere
      #if(nrow(fratrie_comp[fratrie_comp[6] == cas.pere & fratrie_comp[7] != cas.mere & fratrie_comp$sex=="F",])!=0)
      #{fratrie_comp[fratrie_comp[6] == cas.pere & fratrie_comp[7] != cas.mere & fratrie_comp$sex=="F",]$tag <- "une soeur de pÃ¨re"}
      
      # demi soeur de mere
      #if(nrow(fratrie_comp[fratrie_comp[6] != cas.pere & fratrie_comp[7] == cas.mere & fratrie_comp$sex=="F",])!=0)
      #{fratrie_comp[fratrie_comp[6] != cas.pere & fratrie_comp[7] == cas.mere & fratrie_comp$sex=="F",]$tag <- "une soeur de mÃ¨re"}
      
      }
    
      ## generate text
      cas.text <- paste0(etre[cas.dcd], " ", cas_yob(dataframe, Id), ". ", pronom[cas.sex], " ", cas_frat(frat=fratrie, data.id=cas))
      
      #if(nrow(fratrie_comp)!=0 && cas.parents!=0) 
      if(nrow(fratrie)!=0 && cas.parents!=0) # attention, si cas.parents != 0 (exemple pour les parents)
      {
        #fratrie_comp <- fratrie #to remove
        cas_yob.test <- sapply(fratrie_comp[,5], function(i) cas_yob(dataframe, Id=i))
        cas_cancer.test <- sapply(fratrie_comp[,5], function(i) cas_cancer(dataframe, Id=i))
        cas_siblings <- sapply(fratrie_comp[,5], function(i) cas_siblings(dataframe, Id=i))
      
        cas.text2 <- paste0(" ", fratrie_comp$tag, " "
                                  , cas_yob.test
                                  , cas_cancer.test, " "
                                  , cas_siblings
                                  , collapse=" ;" )
      
        cas.text <- paste0(cas.text, " ", pronom[cas.sex], " a", cas.text2)

      }
    
      cas.text
    
  }

  # define text
  output$text <- renderUI({
    
    req(input$table)
    pedigree.table <- hot_to_r(input$table)
    
    colnames(pedigree.table)[2] <- "tag"
    
    # Define cas.index and list of relatives
    cas.index <- pedigree.table[pedigree.table[5]==1,5]
    cas.pere <- pedigree.table[pedigree.table[5]==cas.index,6]
    cas.mere <- pedigree.table[pedigree.table[5]==cas.index,7]
    
    header <- list(c(cas.index, tag[1]),
                   c(cas.pere, tag[2]),
                   c(cas.mere, tag[3]),
                   c(pedigree.table[pedigree.table[5]==cas.pere,6], tag[4]),
                   c(pedigree.table[pedigree.table[5]==cas.pere,7], tag[5]),
                   c(pedigree.table[pedigree.table[5]==cas.mere,6], tag[6]),
                   c(pedigree.table[pedigree.table[5]==cas.mere,7], tag[7]))
    
    ## define conjoint if siblings
    cas = pedigree.table[pedigree.table[5] == cas.index,]
    
    cas.sex = as.numeric(cas[[8]]=="F")-1 # 0 if "F", 1 if "M"
    cas.sex.2 = as.numeric(cas[[8]]=="F")+1 # 1 if "M", 2 if "F"
    
    conjoint.sex <- ifelse(test = cas.sex == 0, 1, 0) # if sex = 1 => add 0
    
    ifelse(any(pedigree.table[,6+conjoint.sex] == cas.index), # if any child (define conjoint as father of index' child)
           {
             cas.enfants <-  pedigree.table[pedigree.table[,6+conjoint.sex] == cas.index,][1,] # take only first line
             Id.conjoint <- cas.enfants[[6+cas.sex]]
             conjoint_text2 <- paste0("Son ", "conjoint est", cas_yob_2(dataframe=pedigree.table, Id=Id.conjoint), cas_cancer(dataframe=pedigree.table, Id=Id.conjoint))
             
           }
           , conjoint_text2 <- paste0(pronom[cas.sex.2], " n'a pas de conjoint")) #1 pour homme, 2 pour femme
    
    conjoint_text <- paste0(conjoint_text2, ".")

    ## fils/fille cas index
    index_enfants <- cas_siblings_2(pedigree.table, Id=pedigree.table[pedigree.table[5]==1,5])

    ## for index, change to pronom
    i = 1 ; cas = pedigree.table[pedigree.table[5]==i,] ; cas.sex = as.numeric(cas[[8]]=="F")+1
    header[[1]][2] <- pronom[cas.sex] 
    
    # Generate full text
    fratrie_text <- paste0(sapply(1:length(header), function(i) paste0(header[[i]][2], " ", cas_tag(pedigree.table, Id=header[[i]][1]))), collapse=".<br/>")

    index_purpose_text <- index_text(dataframe=pedigree.table, Id = 1)
    
    histoire <- c("Histoire familiale")
    
    HTML(paste(h4("Motif de consultation")
               , index_purpose_text
               , h4(histoire)
               , fratrie_text, "<br/>", "<br/>"
               , index_enfants, "<br/>"
               , conjoint_text
               )
         )
  })

  */