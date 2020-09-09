"use strict";
const xml2js = require('xml2js');
var fs = require('fs');
var child_process = require('child_process');
var Mustache = require('mustache');
const Handlebars = require("handlebars");
var _ = require('lodash');
//let ejs = require('ejs');

var filters_processed ;

const parse_cors = function(entities){
    
    var cors_entities = entities.filter(entity => entity.ATTR.type == 'CORS');
    
    cors_entities.forEach( cors_entity => {
        //console.log(JSON.stringify(cors_entities));
        var fvals = cors_entity.fval;
        //console.log(JSON.stringify(fvals));
        var values = fvals.map(val => val.value);
        var names = fvals.map(name => name.ATTR.name);
        console.log(names.join('|')); 
        console.log(values.join('|'));
    });
}
const parse_http = function(entities){
    var http_entities = entities.filter(entity => entity.ATTR.type == 'HTTP');
    
    //console.log(JSON.stringify(http_entities));
    var output = "<ul>";
    http_entities.forEach( http_entity => {
        //console.log(JSON.stringify(http_entity));
        var children = entities.filter(child => child.ATTR.parentPK === http_entity.ATTR.entityPK);
        var vals = http_entity.fval;
        output = output + "<li class='"+http_entity.ATTR.type+"'>"+vals[0].value[0]+"<ul>";
        var ports = entities.filter(child => child.ATTR.parentPK === http_entity.ATTR.entityPK && (child.ATTR.type === 'SSLInterface' || child.ATTR.type === 'InetInterface' ));

        
        ports.forEach(port => {
            var fvals = port.fval;
            var port_value =  fvals.filter(val=> val.ATTR.name == "port");
            output = output + "<li class='"+port.ATTR.type+"'><span>"+port.ATTR.type+" : </span>"+port_value[0].value[0]+"</li>";
        });
        children.forEach(child=> {
            var fvals = child.fval;
            var uris = fvals.filter(val=> val.ATTR.name == "uriprefix");
            uris.forEach(uri=> {output = output + "<li class='"+child.ATTR.type+"'><span>"+child.ATTR.type+" : </span>"+uri.value[0]+"</li>"; });
        });
        output = output + "</ul></li>"        
    });
    output = output + "</li></ul>"
    //console.log(output);
}

const parse_sslInterface = function(entities){
    var sSLInterface_entities = entities.filter(entity => entity.ATTR.type == 'SSLInterface');
    sSLInterface_entities.forEach( sSLInterface_entity => {
        var fvals = sSLInterface_entity.fval;
        var names = fvals.filter( fval => fval.ATTR.name == 'name');
        var pk = sSLInterface_entity.ATTR.entityPK;
        var parent = sSLInterface_entity.ATTR.parentPK;
        var enabled = (fvals.filter(fval => fval.ATTR.name == 'enabled'))[0].value[0];
        var ciphers = (fvals.filter(fval => fval.ATTR.name == 'ciphers'))[0].value[0];
        var port = (fvals.filter(fval => fval.ATTR.name == 'port'))[0].value[0];
        var serverCert =  "";
        var iter = (fvals.filter(fval => fval.ATTR.name == 'serverCert'))[0].value[0];
        do {
            iter = iter.key[0];
            serverCert = serverCert + "/" + iter.id[0].ATTR.value;
                        
        }while (iter.ATTR.type != "Certificate");
        //var sSLInterface = new SSLInterface(names[0].value[0],pk,parent,enabled, ciphers, port,serverCert);
        //sSLInterface_list.push(sSLInterface);
        //console.log(JSON.stringify(sSLInterface));
    });
}

const parse_staticFile= function(entities){
    var staticFile_entities = entities.filter(entity => entity.ATTR.type == 'StaticFile');
    staticFile_entities.forEach( staticFile_entity => {
        var fvals = staticFile_entity.fval;
        //var names = fvals.filter( fval => fval.ATTR.name == 'name');
        var pk = staticFile_entity.ATTR.entityPK;
        var parent = staticFile_entity.ATTR.parentPK;
        var uriprefix = (fvals.filter(fval => fval.ATTR.name == 'uriprefix'))[0].value[0];
        var corsUsage = (fvals.filter(fval => fval.ATTR.name == 'corsUsage'))[0].value[0];
        var file = (fvals.filter(fval => fval.ATTR.name == 'file'))[0].value[0];
        var httpMethod = (fvals.filter(fval => fval.ATTR.name == 'httpMethod'))[0].value[0];
        //var staticFile = new StaticFile(pk, parent,uriprefix,corsUsage,file,httpMethod);
        //staticFile_list.push(staticFile);
        //console.log(JSON.stringify(staticFile));
    });
}

const parse_staticContent= function(entities){
    var staticContent_entities = entities.filter(entity => entity.ATTR.type == 'StaticContent');
    staticContent_entities.forEach( staticContent_entity => {
        var fvals = staticContent_entity.fval;
        //var names = fvals.filter( fval => fval.ATTR.name == 'name');
        var pk = staticContent_entity.ATTR.entityPK;
        var parent = staticContent_entity.ATTR.parentPK;
        var uriprefix = (fvals.filter(fval => fval.ATTR.name == 'uriprefix'))[0].value[0];
        var corsUsage = (fvals.filter(fval => fval.ATTR.name == 'corsUsage'))[0].value[0];
        var indexfile = (fvals.filter(fval => fval.ATTR.name == 'indexfile'))[0].value[0];
        var fileSystemPath = (fvals.filter(fval => fval.ATTR.name == 'fileSystemPath'))[0].value[0];
        var httpMethod = (fvals.filter(fval => fval.ATTR.name == 'httpMethod'))[0].value[0];
        
        //var staticContent = new Statit(pk, parent,uriprefix,corsUsage,indexfile,fileSystemPath,httpMethod);
        //staticContent_list.push(staticContent);
    });
}
const parse_xmlFirewall= function(entities){
    var xmlfirewall_entities = entities.filter(entity => entity.ATTR.type == 'XMLFirewall');

    console.log(JSON.stringify(xmlfirewall_entities));
    xmlfirewall_entities.forEach( xmlfirewall_entity => {
        var fvals = xmlfirewall_entity.fval;
        var values = fvals.map(val => val.value);
        var names = fvals.map(name => name.ATTR.name);
        console.log(names.join('|')); 
        console.log(values.join('|'));
        //console.log(JSON.stringify(xmlfirewall_entity));
        //var fvals = xmlfirewall_entity.fval;
        //var names = fvals.filter( fval => fval.ATTR.name == 'name');
        //var pk = xmlfirewall_entity.ATTR.entityPK;
        //var parent = xmlfirewall_entity.ATTR.parentPK;
        //var uriprefix = (fvals.filter(fval => fval.ATTR.name == 'uriprefix'))[0].value[0];
        //var corsUsage = (fvals.filter(fval => fval.ATTR.name == 'corsUsage'))[0].value[0];
        //var circuit = (fvals.filter(fval => fval.ATTR.name == 'filterCircuit'))[0].value[0];
        //console.log(JSON.stringify(circuits));
        //var filterCircuit =  "";
        //var iter = circuit;
        //do {
        //    iter = iter.key[0];
        //    filterCircuit = filterCircuit + "/" + iter.id[0].ATTR.value;
                        
        //}while (iter.ATTR.type != "FilterCircuit");
        //var cp = fvals.filter(fval => fval.ATTR.name == 'corsProfile');
        //var corsProfile = "";
        //if (typeof cp != undefined && cp.length > 0){
        //    corsProfile = cp[0].value[0]._;
        //}
        //var httpMethod = (fvals.filter(fval => fval.ATTR.name == 'httpMethod'))[0].value[0];
        //var xmlFirewall = new XmlFirewall(pk, parent,uriprefix,corsUsage,filterCircuit,httpMethod,corsProfile);
        //xmlFirewall_list.push(xmlFirewall);
    });
}
const getFilterRef= function(filters,ref,parent,type){
    var filtre = filters.filter(filter=> filter.ATTR.entityPK === ref);
    var fvals = filtre[0].fval;
    var successNode = fvals.filter( fval => fval.ATTR.name === 'successNode');
    var failureNode = fvals.filter(fval => fval.ATTR.name === 'failureNode');
    var name = fvals.filter(fval => fval.ATTR.name === 'name');
    var color;
    var flow = "";
    if (parent !== ""){
        if (type == 'failure'){
            color = 'red';
        } else{
            color = "green"
        }
        //console.log(type + ":" + color);
        flow = flow + '"'+parent + '"->"' + name[0].value[0]+'" [ color = '+color+'];\n';
    }else{
        flow = flow + '"'+ name[0].value[0]+'"[shape = doubleoctagon];\n';
    }
    var exist = filters_processed.filter( fp => fp === name[0].value[0]);
    
    if (exist == ""){
        filters_processed.push(name[0].value[0]);
    
        if ( successNode != undefined && successNode != null && successNode.length != 0 ){  
            if (successNode[0].value[0]._ !== "-1"){
                flow = flow + getFilterRef(filters, successNode[0].value[0]._, name[0].value[0], "success");
            } 
        }
        if ( failureNode != undefined && failureNode != null && failureNode.length != 0){
            if (failureNode[0].value[0]._ !== "-1"){
                flow = flow + getFilterRef(filters, failureNode[0].value[0]._, name[0].value[0], "failure");
            }
        }
    }
    return flow;
}
const generateSvg = function (policy){
    var fvals = policy.fval;
    var names = fvals.filter( fval => fval.ATTR.name == 'name');

    var diagram = 'digraph G { \n subgraph cluster_0 { \n node [style=filled];\n  label = "'+ names[0].value[0] + '" color=blue'; 
    filters_processed = [];

    var filters = entities.filter(ent => ent.ATTR.parentPK ===  policy.ATTR.entityPK);
    var ref = fvals.filter(fval => fval.ATTR.name == 'start');
    var flow = getFilterRef(filters, ref[0].value[0]._,"");
    diagram = diagram + "\n" + flow + "}\n }"; 
    var dot_filename = "dot/"+names[0].value[0]+".dot";
    dot_filename = dot_filename.replace(/ /g,"_");
    dot_filename = dot_filename.replace(/\(/g,"");
    dot_filename = dot_filename.replace(/\)/g,"");
    var svg_filename = "svg/"+names[0].value[0]+".svg";
    svg_filename = svg_filename.replace(/ /g,"_");
    svg_filename = svg_filename.replace(/\(/g,"");
    svg_filename = svg_filename.replace(/\)/g,"");
    fs.writeFile(dot_filename, diagram, function (err) {
        if (err) return console.log(err);
    });
}
const parser = new xml2js.Parser({ attrkey: "ATTR" });

let listener = fs.readFileSync('ListenersStore.xml', "utf8");
parser.parseString(listener, function(error, result) {
    if(error === null) {
        var entities = result.entityStoreData.entity;
        //parse_cors(entities);
        
        parse_http(entities);
        
    }
    else {
        console.log(error);
    }
});


  let primaryStore = fs.readFileSync("PrimaryStore.xml", "utf8");

  parser.parseString(primaryStore, function(error, result) {
    if(error === null) {
        var entities = result.entityStoreData.entity;
        
        var pols = entities.filter(entity => entity.ATTR.type == 'FilterCircuit');
        var policies = {};
        policies["policies"] = pols.map(entity => {
            var f = entity.fval;
            var fvals = new Object();
            f.forEach(fval=>{
                if(fval.value != undefined){
                    if(fval.value[0].ATTR != undefined){
                        if(fval.value[0]._ !== "-1"){
                            var reference = entities.filter(ent => ent.ATTR.entityPK === fval.value[0]._);
                            var val = reference[0].fval;
                            var fv = val.filter(fval => fval.ATTR.name === "name");
                            fvals[fval.ATTR.name] = fv[0].value[0];   
                        }else{
                            fvals[fval.ATTR.name] = fval.value[0]._;
                        }
                    }else{
                        fvals[fval.ATTR.name] = fval.value[0];
                    }
                    
                }else{
                    fvals[fval.ATTR.name] = fval.value;
                }
                
            });

            var fils = entities.filter(ent => ent.ATTR.parentPK === entity.ATTR.entityPK);
            
            var filters  = fils.map(filter => {
                var params = new Object();
                filter.fval.forEach(fval=>{
                    if(fval.value != undefined){
                        if(fval.value[0].ATTR != undefined){
                            if(fval.value[0]._ !== "-1" && fval.value[0]._ !== undefined){
                                var reference = entities.filter(ent => ent.ATTR.entityPK === fval.value[0]._);
                                //console.log(fval.value[0]._);
                                //console.log(JSON.stringify(reference));
                                
                                var val = reference[0].fval;
                                
                                var fv;
                                if(reference[0].ATTR.type === "Stylesheet"){
                                    var fv = val.filter(fval => fval.ATTR.name === "URL"); 
                                }else if (reference[0].ATTR.type === "MimeType"){
                                    var fv = val.filter(fval => fval.ATTR.name === "mimeType");
                                     
                                }else{
                                    var fv = val.filter(fval => fval.ATTR.name === "name");
                                }
                                fvals[fval.ATTR.name] = fv[0].value[0]; 
                            }else{
                                fvals[fval.ATTR.name] = fval.value[0]._;
                            }  
                        }else{
                            params[fval.ATTR.name] = fval.value[0];
                        }
                      
                    }else{
                        params[fval.ATTR.name] = fval.value;
                    }
                    
                });

                return {
                    "type" : filter.ATTR.type,
                    "entityPK" : filter.ATTR.entityPK,
                    "parentPK" : filter.ATTR.parentPK,
                    "params" : params
                }
            });
            var names = f.filter( fval => fval.ATTR.name == 'name');

            var diagram = 'digraph G { \n subgraph cluster_0 { \n node [style=filled];\n  label = "'+ names[0].value[0] + '" color=blue'; 
            filters_processed = [];

            //var filters = entities.filter(ent => ent.ATTR.parentPK ===  entity.ATTR.entityPK);
	        if( ref != undefined)
	        {   
              var ref = f.filter(fval => fval.ATTR.name == 'start');
              var flow = getFilterRef(fils, ref[0].value[0]._,"");
              diagram = diagram + "\n" + flow + "}\n }";

              var dot_filename = "dot/"+names[0].value[0]+".dot";
              console.log("dot_filename" + dot_filename);
              dot_filename = dot_filename.replace(/ /g,"_");
              dot_filename = dot_filename.replace(/\(/g,"");
              dot_filename = dot_filename.replace(/\)/g,"");
              svg_filename = svg_filename.replace(/ /g,"_");
              svg_filename = svg_filename.replace(/\(/g,"");
              svg_filename = svg_filename.replace(/\)/g,"");
              fs.writeFile(dot_filename, diagram, function (err) {
                if (err) return console.log(err);
              });
              
            }
            return {
                "type" : entity.ATTR.type,
                "entityPK" : entity.ATTR.entityPK,
                "parentPK" : entity.ATTR.parentPK,
                "fval" : fvals,
                "filters" : filters,
                "svg" : "file://///wsl$/Ubuntu/home/seb/src/fed_analyze/"+svg_filename
                }
        });
        Handlebars.registerHelper("debug", function(optionalValue) {
            console.log("Current Context");
            console.log("====================");
            console.log(this);
          
            if (optionalValue) {
              console.log("Value");
              console.log("====================");
              console.log(optionalValue);
            }
          });
        //console.log(JSON.stringify(policies));
        fs.readFile("templates/rapport.hbs", function (err, data) {
            if (err) throw err;
            const template = Handlebars.compile(data.toString());
              //var output = Mustache.render(data.toString(), policies);
             console.log(JSON.stringify(policies));
              //console.log(template(policies));
         });
        //pols.forEach( pol =>{
        //    var fvals = pol.fval;
        //    var names = fvals.filter( fval => fval.ATTR.name == 'name');
        //    var pk = pol.ATTR.entityPK;
        //    var diagram = 'digraph G { \n subgraph cluster_0 { \n node [style=filled];\n  label = "'+ names[0].value[0] + '" color=blue'; 
        //    filters_processed = [];

        //    var filters = entities.filter(ent => ent.ATTR.parentPK === pk);
        //    var ref = fvals.filter(fval => fval.ATTR.name == 'start');
        //    var flow = getFilterRef(filters, ref[0].value[0]._,"");
        //    diagram = diagram + "\n" + flow + "}\n }"; 
        //    var dot_filename = "dot/"+names[0].value[0]+".dot";
        //    dot_filename = dot_filename.replace(/ /g,"_");
        //    dot_filename = dot_filename.replace(/\(/g,"");
        //    dot_filename = dot_filename.replace(/\)/g,"");
        //    var svg_filename = "svg/"+names[0].value[0]+".svg";
        //    svg_filename = svg_filename.replace(/ /g,"_");
        //    svg_filename = svg_filename.replace(/\(/g,"");
        //    svg_filename = svg_filename.replace(/\)/g,"");
        //    fs.writeFile(dot_filename, diagram, function (err) {
        //        if (err) return console.log(err);
        //    });    
        //});
    } else {
        console.log(error);
    }
});
