function init(){myScene=new Scene("threejs_canvas",.001,1e6);let e=document.URL,t="../static/uploads/"+e.substring(e.lastIndexOf("/")+1);switch(t.substring(t.lastIndexOf(".")+1).toLowerCase()){case"ply":myScene.load(new THREE.PLYLoader,t);break;case"stl":myScene.load(new THREE.STLLoader,t);break;default:console.log("Unsupported file type")}annotations=new AnnotationTool(myScene),measurements=new MeasurementTool(myScene),pointManager=new PointManager(myScene,annotations,measurements),scalePanel=new ScalePanel(myScene),controls=new THREE.OrbitControls(myScene.camera,myScene.renderer.domElement)}function animate(){requestAnimationFrame(animate),myScene.renderer.render(myScene.threeScene,myScene.camera)}class Utils{static changeCursor(e,t){e.style.cursor=t}static getColor(e){const t=new THREE.Color(9474192),n=new THREE.Color(16711680),i=new THREE.Color(65280),s=(new THREE.Color(255),new THREE.Color(16711680)),o=new THREE.Color(65280);switch(e){case"annotation-standard":return n;case"annotation-highlighted":return i;case"material-standard":return t;case"measurement-standard":return s;case"measurement-highlighted":return o;default:return console.warn("Warning, no color defined for "+e),new THREE.Color}}static saveTextAs(e,t){let n=document.createElement("a");if(n.href="data:text/plain;charset=utf-8,"+encodeURIComponent(e),n.download=t,document.createEvent){let e=document.createEvent("MouseEvents");e.initEvent("click",!0,!0),n.dispatchEvent(e)}else n.click()}static loadJSON(e,t){let n=new FileReader;n.onloadend=t,n.readAsText(e)}}class Scene{constructor(e,t,n){this.threeScene=new THREE.Scene,this.canvasNode=document.getElementById(e),this.renderer=new THREE.WebGLRenderer({canvas:this.canvasNode}),this.renderer.setSize(this.canvasNode.clientWidth,this.canvasNode.clientHeight,!1),this.camera=new THREE.PerspectiveCamera(75,this.canvasNode.clientWidth/this.canvasNode.clientHeight,t,n),this.camera.position.set(0,0,500),this.threeScene.add(this.camera),this.raycaster=new THREE.Raycaster,this.mouse=new THREE.Vector2,this.__attachUpdateMouseCoordinatesEventListener(),this.__attachResizeCanvasEventListener()}setupLights(e,t){let n=new THREE.PointLight(16777215,e),i=new THREE.AmbientLight(16777215,t);this.camera.add(n),this.threeScene.add(i)}remove(e){this.threeScene.remove(e)}add(e){this.threeScene.add(e)}load(e,t){let n=this;this.autoZoom;e.load(t,function(e){e.computeVertexNormals();let t;void 0!==e.attributes.color||e.hasColors?(t=new THREE.MeshStandardMaterial({shading:THREE.FlatShading,vertexColors:THREE.VertexColors}),n.setupLights(.1,2)):(t=new THREE.MeshStandardMaterial({color:Utils.getColor("material-standard"),shading:THREE.SmoothShading}),n.setupLights(.6,.4)),n.theObject=new THREE.Mesh(e,t),null===n.theObject.geometry.boundingSphere&&n.theObject.geometry.computeBoundingSphere();let i=n.theObject.geometry.boundingSphere.center;n.theObject.position.sub(i),n.add(n.theObject),n.autoZoom()})}autoZoom(){let e=this.theObject.geometry.boundingSphere.radius;let t=this.camera.fov/2*Math.PI/180,n=1.25*e/Math.tan(t);this.camera.position.z=n}get radius(){return.007*this.theObject.geometry.boundingSphere.radius}__attachUpdateMouseCoordinatesEventListener(){let e=this.mouse,t=this;t.canvasNode.addEventListener("mousemove",function(n){e.x=(n.clientX-t.canvasNode.offsetLeft-1)/t.canvasNode.clientWidth*2-1,e.y=-(n.clientY-t.canvasNode.offsetTop-1)/t.canvasNode.clientHeight*2+1})}__attachResizeCanvasEventListener(){let e=this;window.addEventListener("resize",function(){e.renderer.setSize(e.canvasNode.clientWidth,e.canvasNode.clientHeight,!1),e.camera.aspect=e.canvasNode.clientWidth/e.canvasNode.clientHeight,e.camera.updateProjectionMatrix()})}}class AbstractTool{constructor(e){if(this.constructor===AbstractTool)throw new TypeError("Abstract class 'AbstractTool' cannot be instantiated.");if(void 0===this.__initParticleMenu)throw new TypeError("__initParticleMenu method must be implemented");if(void 0===this.__selectParticleEventListener)throw new TypeError("__selectParticleEventListener method must be implemented");if(void 0===this.__addParticleDisposableEvent)throw new TypeError("__addParticleDisposableEvent method must be implemented");if(void 0===this.__removeParticleEventListener)throw new TypeError("__removeParticleEventListener method must be implemented");if(void 0===this.__removeParticleDisposableEvent)throw new TypeError("__removeParticleDisposableEvent method must be implemented");if(void 0===this.removeParticle)throw new TypeError("removeParticle method must be implemented");if(void 0===this.toggleColor)throw new TypeError("toggleColor method must be implemented");this.myScene=e,this.elements=[],this.__selectParticleEventListener(),this.__initParticleMenu(),this.__initAddButton(),this.__initUnselectButton(),this.__initRemoveButton(),this.__initEditButton(),this.__addParticleDisposableEvent=this.__addParticleDisposableEvent.bind(this),this.__removeParticleDisposableEvent=this.__removeParticleDisposableEvent.bind(this)}__addParticleEventListener(){Utils.changeCursor(this.myScene.canvasNode,"copy"),this.myScene.canvasNode.addEventListener("mousedown",this.__addParticleDisposableEvent)}__removeParticleEventListener(){Utils.changeCursor(this.myScene.canvasNode,"pointer"),this.myScene.canvasNode.addEventListener("mousedown",this.__removeParticleDisposableEvent)}__changeTagValue(e,t){for(let n of this.elements)if(n.mainParticle.uuid===e){n.mainParticle.threeObject.userData=t;break}}__removeElement(e){for(let t of this.elements)if(t.mainParticle.threeObject===e){this.removeParticle(t);break}}}class AbstractElement{constructor(e,t,n){if(this.constructor===AbstractElement)throw new TypeError("Abstract class 'AbstractElement' cannot be instantiated.");if(void 0===this.toggleColor)throw new TypeError("toggleColor method must be implemented.");if(void 0===this.clear)throw new TypeError("clear method must be implemented.");if(void 0===this.add)throw new TypeError("add method must be implemented.");if(void 0===this.__lookupGetter__("mainParticle"))throw new TypeError("mainParticle getter method must be implemented");this.myScene=e,this.defaultColor=t,this.highlightedColor=n}}class Particle{constructor(e,t,n){if(this.myScene=e,this.defaultColor=t,this.highlightedColor=n,this.threeObject=null,this.constructor===Particle)throw new TypeError("Abstract class 'AbstractElement' cannot be instantiated.");if(void 0===this.toggleColor)throw new TypeError("toggleColor method must be implemented.");if(void 0===this.clear)throw new TypeError("clear method must be implemented.");if(void 0===this.add)throw new TypeError("add method must be implemented.")}get uuid(){return this.threeObject.uuid}}class Sphere extends Particle{constructor(e,t,n){super(e,t,n)}add(e){let t=this.defaultColor,n=new THREE.MeshPhongMaterial({color:t}),i=new THREE.SphereGeometry(this.myScene.radius),s=new THREE.Mesh(i,n);s.translateX(e.x),s.translateY(e.y),s.translateZ(e.z),s.name="Annotation",s.userData="an annotation",this.myScene.add(s),this.threeObject=s}clear(){this.myScene.remove(this.threeObject),this.threeObject=null}toggleColor(){let e=this.threeObject.material.color;e.equals(this.defaultColor)?this.threeObject.material.color=this.highlightedColor:e.equals(this.highlightedColor)?this.threeObject.material.color=this.defaultColor:console.warn("Problem during toggling a color")}}class AnnotationElement extends AbstractElement{constructor(e,t,n){super(e,t,n),this.sphere=null}add(e){if(null!==this.sphere)throw new Error("This annotation already has a sphere.");this.sphere=new Sphere(this.myScene,this.defaultColor,this.highlightedColor),this.sphere.add(e)}clear(){this.sphere.clear(),this.sphere=null}toggleColor(){if(null===this.sphere)throw new Error("This annotation has no sphere to change color to.");this.sphere.toggleColor()}get mainParticle(){return this.sphere}}class AnnotationTool extends AbstractTool{constructor(e){super(e)}__selectParticleEventListener(){let e=this;this.myScene.canvasNode.addEventListener("mousedown",function(){e.myScene.raycaster.setFromCamera(e.myScene.mouse,e.myScene.camera);let t=[];e.elements.forEach(function(e){t.push(e.sphere.threeObject)});let n=e.myScene.raycaster.intersectObjects(t,!1);if(n.length>0){let t=n[0].object;e.elements.forEach(function(e){e.sphere.threeObject===t&&e.toggleColor()});let i=t.uuid;$("#annotation-list li[uuid='"+i+"']").toggleClass("ui-selected")}})}__addParticleDisposableEvent(e){this.myScene.raycaster.setFromCamera(this.myScene.mouse,this.myScene.camera);let t=this.myScene.raycaster.intersectObject(this.myScene.theObject,!1);if(t.length>0){let n=t[0].point;e.target.removeEventListener(e.type,this.__addParticleDisposableEvent),Utils.changeCursor(this.myScene.canvasNode,""),this.addPoint(n)}}addPoint(e,t){let n=new AnnotationElement(this.myScene,Utils.getColor("annotation-standard"),Utils.getColor("annotation-highlighted"));n.add(e),this.elements.push(n);let i=this.elements.length-1,s=this.elements[i].sphere.threeObject.uuid;t?this.elements[i].sphere.threeObject.userData=t:t=this.elements[i].sphere.threeObject.userData;let o=$('<li uuid="'+s+'">'+t+"</li>");$("#annotation-list").append(o)}__removeParticleDisposableEvent(e){this.myScene.raycaster.setFromCamera(this.myScene.mouse,this.myScene.camera);let t=[];this.elements.forEach(function(e){t.push(e.sphere.threeObject)});let n=this.myScene.raycaster.intersectObjects(t,!1);if(n.length>0){Utils.changeCursor(this.myScene.canvasNode,""),e.target.removeEventListener(e.type,this.__removeParticleDisposableEvent);let t=n[0].object;this.__removeElement(t)}}removeParticle(e){let t=this.elements.indexOf(e);this.elements.splice(t,1);let n=e.sphere.threeObject.uuid;e.clear(),$("#annotation-list li[uuid='"+n+"']")[0].remove()}__initParticleMenu(){let e=this;$("#annotation-list").selectable({selecting:function(t,n){e.elements.forEach(function(e){e.sphere.threeObject.uuid===n.selecting.attributes.uuid.value&&e.toggleColor()})},unselecting:function(t,n){e.elements.forEach(function(e){e.sphere.threeObject.uuid===n.unselecting.attributes.uuid.value&&e.toggleColor()})}})}__initUnselectButton(){let e=this;$("#unselect-annotation-button").click(function(){$("#annotation-list .ui-selected").each(function(){$(this).removeClass("ui-selected");let t=$(this).context.attributes.uuid.value;e.elements.forEach(function(e){e.sphere.threeObject.uuid===t&&e.toggleColor()})})}).button({icon:"ui-icon-flag",text:!1})}__initAddButton(){let e=this;$("#add-annotation-button").click(function(){e.__addParticleEventListener()}).button({icon:"ui-icon-plus",text:!1})}__initRemoveButton(){let e=this;$("#remove-annotation-button").click(function(){let t=$("#annotation-list .ui-selected");if(0===t.length)$("#removing-warn").dialog({title:"Info"}),e.__removeParticleEventListener(e);else{let n=[];t.each(function(e,t){n.push(t.attributes.uuid.value)});let i=[];for(let t of n)e.elements.forEach(function(e){e.sphere.threeObject.uuid===t&&i.push(e)});for(let t of i)e.removeParticle(t)}}).button({icon:"ui-icon-trash",text:!1})}__initEditButton(){let e=this;$("#edit-annotation-button").click(function(){let t=$("#annotation-list .ui-selected");if(0===t.length||t.length>1)$("#select-one-warn").dialog({title:"Warning!"});else{let n=(t=t[0]).attributes.uuid.value;$("#tag").dialog({title:"Editing...",modal:!0,open:function(){$("#tag-content").val(t.textContent).on("keypress",function(e){switch(e.keyCode){case 13:$('.ui-button:contains("Save")').click();break;case 27:$('.ui-button:contains("Close")').click()}})},buttons:{Save:function(){let t=$("#annotation-list li[uuid='"+n+"']")[0],i=$("#tag-content")[0].value;t.textContent=i,e.__changeTagValue(n,i),$(this).dialog("close")},Cancel:function(){$(this).dialog("close")}}})}}).button({icon:"ui-icon-pencil",text:!1})}toJSON(){let e=[];for(let t of this.elements){let n={},i=t.sphere.threeObject;n.tag=i.userData,n.points=[i.position],e.push(n)}return{annotations:e}}toggleColor(){console.warn("Method toggleColor unimplemented")}}class Line extends Particle{constructor(e,t,n){super(e,t,n)}add(e,t){let n=new THREE.LineBasicMaterial,i=new THREE.Geometry,s=e.threeObject.position,o=t.threeObject.position;i.vertices.push(s,o);let r=new THREE.Line(i,n);r.add(e.threeObject),r.add(t.threeObject),this.myScene.add(r),this.threeObject=r}clear(){this.myScene.remove(this.threeObject),this.threeObject=null}toggleColor(){throw new TypeError("Unimplemented method")}}class MeasurementElement extends AbstractElement{constructor(e,t,n){super(e,t,n),this.sphere1=null,this.sphere2=null,this.line=null}add(e){if(null===this.sphere1)this.sphere1=new Sphere(this.myScene,this.defaultColor,this.highlightedColor),this.sphere1.add(e);else{if(null!==this.sphere2)throw new Error("Cannot call add more times.");this.sphere2=new Sphere(this.myScene,this.defaultColor,this.highlightedColor),this.sphere2.add(e),this.line=new Line(this.myScene),this.line.add(this.sphere1,this.sphere2),this.line.threeObject.userData="a measurement"}}clear(){this.sphere1.clear(),this.sphere=null,this.sphere2.clear(),this.sphere2=null,this.line.clear(),this.line=null}toggleColor(){if(null===this.sphere1||null===this.sphere2)throw new Error("This measurement has no particles to change color to.");this.sphere1.toggleColor(),this.sphere2.toggleColor()}isComplete(){return null!==this.sphere1&&null!==this.sphere2&&null!==this.line}get mainParticle(){return this.line}get threeObjects(){return null!==this.sphere1&&null!==this.sphere2?[this.sphere1.threeObject,this.sphere2.threeObject]:null!==this.sphere2?[this.sphere2.threeObject]:null!==this.sphere1?[this.sphere1.threeObject]:void 0}}class MeasurementTool extends AbstractTool{constructor(e){super(e)}__selectParticleEventListener(){let e=this;this.myScene.canvasNode.addEventListener("mousedown",function(){e.myScene.raycaster.setFromCamera(e.myScene.mouse,e.myScene.camera);let t=[];e.elements.forEach(function(e){t.push(...e.threeObjects)});let n=e.myScene.raycaster.intersectObjects(t,!1);if(n.length>0){let t=n[0].object.parent;for(let n of e.elements)if(t===n.line.threeObject){n.toggleColor();break}let i=t.uuid;$("#measurement-list li[uuid='"+i+"']").toggleClass("ui-selected")}})}__addParticleDisposableEvent(e){this.myScene.raycaster.setFromCamera(this.myScene.mouse,this.myScene.camera);let t=this.myScene.raycaster.intersectObject(this.myScene.theObject,!1);if(t.length>0){let n=t[0].point;this.addPoint(n),this.elements.slice(-1).pop().isComplete()&&(Utils.changeCursor(this.myScene.canvasNode,""),e.target.removeEventListener(e.type,this.__addParticleDisposableEvent))}}addPoint(e,t){let n=this.elements.slice(-1).pop();if(!n||n.isComplete()){let e=new MeasurementElement(this.myScene,Utils.getColor("measurement-standard"),Utils.getColor("measurement-highlighted"));this.elements.push(e),n=this.elements.slice(-1).pop()}if(n.add(e),n.isComplete()){let e=n.sphere1.threeObject.position,i=n.sphere2.threeObject.position,s=e.clone().sub(i).length().toFixed(4),o=$('<li uuid="'+n.line.threeObject.uuid+'" tag="'+t+'" distance="'+s+'">'+t+" "+s+"</li>");$("#measurement-list").append(o)}}__removeParticleDisposableEvent(e){this.myScene.raycaster.setFromCamera(this.myScene.mouse,this.myScene.camera);let t=[];this.elements.forEach(function(e){t.push(...e.threeObjects)});let n=this.myScene.raycaster.intersectObjects(t,!1);if(n.length>0){Utils.changeCursor(this.myScene.canvasNode,""),e.target.removeEventListener(e.type,this.__removeParticleDisposableEvent);let t=n[0].object.parent;this.__removeElement(t)}}removeParticle(e){let t=this.elements.indexOf(e);this.elements.splice(t,1),$("#measurement-list li[uuid='"+e.mainParticle.uuid+"']")[0].remove(),e.clear()}__initUnselectButton(){let e=this;$("#unselect-measurement-button").click(function(){$("#measurement-list .ui-selected").each(function(){$(this).removeClass("ui-selected");let t=$(this).context.attributes.uuid.value;e.toggleColor(t)})}).button({icon:"ui-icon-flag",text:!1})}__initAddButton(){let e=this;$("#add-measurement-button").click(function(){e.__addParticleEventListener()}).button({icon:"ui-icon-plus",text:!1})}__initRemoveButton(){let e=this;$("#remove-measurement-button").click(function(){let t=$("#measurement-list .ui-selected");0===t.length?($("#removing-warn").dialog({title:"Info"}),e.__removeParticleEventListener()):t.each(function(t,n){let i=n.attributes.uuid.value;for(let t of e.elements)if(t.mainParticle.uuid===i){e.removeParticle(t);break}})}).button({icon:"ui-icon-trash",text:!1})}__initEditButton(){let e=this;$("#edit-measurement-button").click(function(){let t=$("#measurement-list .ui-selected");if(0===t.length||t.length>1)$("#select-one-warn").dialog({title:"Warning!"});else{let n=(t=t[0]).attributes.uuid.value;$("#tag").dialog({title:"Editing...",modal:!0,open:function(){$("#tag-content").val(t.attributes.tag.value).on("keypress",function(e){switch(e.keyCode){case 13:$('.ui-button:contains("Save")').click();break;case 27:$('.ui-button:contains("Close")').click()}})},buttons:{Save:function(){let t=$("#measurement-list li[uuid='"+n+"']")[0],i=$("#tag-content")[0].value;t.attributes.tag.value=i;let s=t.attributes.distance.value;t.textContent=i+" "+s,e.__changeTagValue(n,i),$(this).dialog("close")},Cancel:function(){$(this).dialog("close")}}})}}).button({icon:"ui-icon-pencil",text:!1})}__initParticleMenu(){let e=this;$("#measurement-list").selectable({selecting:function(t,n){e.toggleColor(n.selecting.attributes.uuid.value)},unselecting:function(t,n){e.toggleColor(n.unselecting.attributes.uuid.value)}})}toJSON(){let e=[];for(let t of this.elements){let n={},i=t.line.threeObject,s=t.sphere1.threeObject,o=t.sphere2.threeObject;n.tag=i.userData,n.points=[s.position,o.position],e.push(n)}return{measurements:e}}toggleColor(e){let t=this.myScene.threeScene.getObjectByProperty("uuid",e);for(let e of this.elements)if(e.line.threeObject===t){e.toggleColor();break}}}class ScalePanel{constructor(e){this.myScene=e,this.parameters={"Model units":{mm:1,cm:10,in:25.4},"Grid units":{mm:1,cm:10,in:25.4},"Grid Helper":!1},this.gui=new dat.GUI,this.__addGUI()}refreshGridHelper(){void 0!=this.myScene.threeScene.getObjectByName("MyGridHelper")&&(this.toggleGridHelper(!1),this.toggleGridHelper(!0))}toggleGridHelper(e,t){let n;if(n=t||this,e){new THREE.Mesh;n.myScene.theObject.geometry.computeBoundingBox();const e=n.myScene.theObject.geometry.boundingBox,t=e.max.clone().sub(e.min);let i=Math.ceil(Math.max(t.x,t.z));const s=n.getModelSizeFactor(),o=n.getGridSizeFactor(),r=Math.ceil(i*s/o),a=r*o/s;let l=new THREE.GridHelper(a,r);l.name="MyGridHelper";const c=t.clone().divideScalar(2);l.position.y-=c.y,l.position.y*=1.001,n.myScene.add(l)}else n.myScene.remove(n.myScene.threeScene.getObjectByName("MyGridHelper"))}getModelSizeFactor(){return this.gui.__folders.Units.__controllers[0].__select.value}getGridSizeFactor(){return this.gui.__folders.Units.__controllers[1].__select.value}__addGUI(){let e=this.gui.addFolder("Units"),t=e.add(this.parameters,"Model units",this.parameters["Model units"]),n=e.add(this.parameters,"Grid units",this.parameters["Grid units"]),i=this;e.add(this.parameters,"Grid Helper").onFinishChange(function(e){!function(e,t){t.toggleGridHelper(e,t)}(e,i)});let s=this.parameters["Model units"].mm,o=this.parameters["Grid units"].mm;t.setValue(s),n.setValue(o),t.onFinishChange(this.refreshGridHelper),n.onFinishChange(this.refreshGridHelper)}}class PointManager{constructor(e,t,n){this.myScene=e,this.annotations=t,this.measurements=n,this.__initImportButton(),this.__initExportButton()}__initImportButton(){let e=this;$("#import-points").click(function(){$("#file").click()}).button({icon:"ui-icon-arrowthickstop-1-n",text:!1}),$("#file").change(function(){let t=this.files[0];Utils.loadJSON(t,function(t){let n=t.target.result,i=JSON.parse(n),s=document.URL,o=s.substring(s.lastIndexOf("/")+1);i.filename!==o&&$("#not-same-model-warn").dialog({title:"Warning!"});let r=i.annotations;for(let t of r){let n=t.points[0],i=t.tag;e.annotations.addPoint(n,i)}let a=i.measurements;for(let t of a){let n=t.points[0],i=t.points[1],s=t.tag;e.measurements.addPoint(n),e.measurements.addPoint(i,s)}})})}__initExportButton(){let e=this;$("#export-points").click(function(){let t=document.URL,n=t.substring(t.lastIndexOf("/")+1),i=e.annotations.toJSON(),s=e.measurements.toJSON(),o=Object.assign({filename:n},i,s);$.ajax({url:"/_add_checksum_to_json",type:"POST",data:JSON.stringify(o),dataType:"json",contentType:"application/json; charset=utf-8",success:function(e){Utils.saveTextAs(JSON.stringify(e),"points.json")}})}).button({icon:"ui-icon-arrowthickstop-1-s",text:!1})}}let myScene,controls,measurements,scalePanel,annotations,pointManager;init(),animate();
