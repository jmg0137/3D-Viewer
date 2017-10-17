import {AbstractTool} from "./AbstractTool.js";
import {Utils} from "./Utils.js";
import {AnnotationElement} from "./AnnotationElement.js";

/**
 * @fileoverview A tool to manage the annotations (adding them, removing them, etc.)
 */

export class AnnotationTool extends AbstractTool {
    /**
     * @constructor
     * @class Just an implementation of AbstractTool that manages annotations.
     * @param {Scene} myScene - The scene where the annotations will be attached.
     */
    constructor(myScene) {
        super(myScene);
    }

    /**
     * It adds a permanent event listener that selects and unselects the annotations, in the model and into the gui.
     */
    __selectParticleEventListener() {
        //Lights up or down an annotation in the model and on the lateral menu.
        let instance = this;
        this.myScene.canvasNode.addEventListener('mousedown', function() {
            instance.myScene.raycaster.setFromCamera(instance.myScene.mouse, instance.myScene.camera);
            let threeObjects = [];
            instance.elements.forEach( function(annotation) {
                threeObjects.push(annotation.sphere.threeObject);
            });
            let intersected = instance.myScene.raycaster.intersectObjects(threeObjects,false);
            if (intersected.length > 0){
                let selectingObject = intersected[0].object;
                instance.elements.forEach( function(annotation) {
                    if (annotation.sphere.threeObject === selectingObject) {
                        annotation.toggleColor();
                    }
                });
                let uuid = selectingObject.uuid;
                //If it is normal, highlight it
                $("#annotation-list li[uuid='" + uuid + "']").toggleClass("ui-selected");
            }
        });
    }

    /**
     * Finds out what object is being intersected and also the coordinates of the point
     * where it happens and call to add an annotation to this location.
     */
    __addParticleDisposableEvent(event){
        this.myScene.raycaster.setFromCamera(this.myScene.mouse,this.myScene.camera);
        let intersected = this.myScene.raycaster.intersectObject(this.myScene.theObject,false);
        if (intersected.length > 0){
            let point = intersected[0].point;
            event.target.removeEventListener(event.type, this.__addParticleDisposableEvent);
            //Let cursor style as default.
            Utils.changeCursor(this.myScene.canvasNode, "");
            this.addPoint(point);
        }
    }

    /**
     * Adds a sphere on the specified point.
     * @point {THREE.Vector3} point - Coordinates where to add a sphere.
     */
    addPoint(point, annotation) {
        let annotationElement = new AnnotationElement(this.myScene, Utils.getColor("annotation-standard"), Utils.getColor("annotation-highlighted"));
        annotationElement.add(point);
        this.elements.push(annotationElement);
        let lastIndex = this.elements.length - 1,
            uuid = this.elements[lastIndex].sphere.threeObject.uuid;

        if (!annotation) {
            annotation = this.elements[lastIndex].sphere.threeObject.userData;
        } else {
            this.elements[lastIndex].sphere.threeObject.userData = annotation;
        }
        let newLi = $('<li uuid="' + uuid + '">' + annotation + "</li>");
        $( "#annotation-list" ).append(newLi)
    }

    /**
     * Removes an annotation point if the mouse coordinates from the event touches
     * any annotation.
     */
    __removeParticleDisposableEvent(event){
        this.myScene.raycaster.setFromCamera(this.myScene.mouse, this.myScene.camera);
        let threeObjects = [];
        this.elements.forEach( function(annotation) {
            threeObjects.push(annotation.sphere.threeObject);
        });
        let intersected = this.myScene.raycaster.intersectObjects(threeObjects,false);
        if (intersected.length > 0){
            //Let cursor style as default.
            Utils.changeCursor(this.myScene.canvasNode, "");
            event.target.removeEventListener(event.type, this.__removeParticleDisposableEvent);
            let deletingObject = intersected[0].object;
            this.__removeElement(deletingObject);
        }
    }

    /**
     * Removes an object from the scene and also from the gui.
     */
    removeParticle(annotation){
        let removingIndex = this.elements.indexOf(annotation);
        this.elements.splice(removingIndex,1);
        let uuid = annotation.sphere.threeObject.uuid;
        annotation.clear();
        $("#annotation-list li[uuid='" + uuid + "']")[0].remove();
    }

    /**
     * Inits the annotation menu.
     */
    __initParticleMenu() {
        let instance = this;
        $( "#annotation-list" ).selectable({	
            //hightlight
            selecting: function(event, ui) {
                instance.elements.forEach( function(annotationElement) {
                    if (annotationElement.sphere.threeObject.uuid === ui.selecting.attributes["uuid"].value) {
                        annotationElement.toggleColor();
                    }
                });
            },	//un?highlight
            unselecting: function(event, ui){
                instance.elements.forEach( function(annotationElement) {
                    if (annotationElement.sphere.threeObject.uuid === ui.unselecting.attributes["uuid"].value) {
                        annotationElement.toggleColor();
                    }
                });
            }
	    });
    }

    /**
     * Inits the unselect button.
     * This button unselects all the annotations currently selected.
     */
    __initUnselectButton() {
        let instance = this;
        $( "#unselect-annotation-button" ).click(
            function(){
                $( "#annotation-list .ui-selected" ).each(function(){
                    //Remove selected attribute from UI.
                    $(this).removeClass("ui-selected");
                    //Toggle annotation color
                    let uuid = $(this).context.attributes["uuid"].value;
                    instance.elements.forEach( function(annotationElement) {
                        if (annotationElement.sphere.threeObject.uuid === uuid) {
                            annotationElement.toggleColor();
                        }
                    });
                });
            }
        ).button({
            icon: "ui-icon-flag",
            text: false
        });
    }

    /**
     * Inits the add button.
     */
    __initAddButton() {
        let instance = this;
        $( "#add-annotation-button" ).click(
            function () {
                instance.__addParticleEventListener();
            }
        ).button({
            icon: "ui-icon-plus",
            text: false
        });
    }

    /**
     * Inits the remove button.
     * This button can either:
     * *Remove the selected annotations
     * *If no one is selected, the next selected one will be removed.
     */
    __initRemoveButton() {
        let instance = this;
        $( "#remove-annotation-button").click(
            function(){
                let selected = $( "#annotation-list .ui-selected");
                if (selected.length === 0){
                    $( "#removing-warn").dialog({
                        title: "Info"
                    });
                    instance.__removeParticleEventListener(instance);
                }else{
                    let listOfUuids = []
                    selected.each(
                        function(index, element){
                            listOfUuids.push(element.attributes["uuid"].value);
                        }
                    );
                    let selectedOnes = [];
                    for (let uuid of listOfUuids) {
                        instance.elements.forEach(
                            function(annotationElement){
                                if (annotationElement.sphere.threeObject.uuid === uuid){
                                    selectedOnes.push(annotationElement);
                                }
                            }
                        );
                    }
                    for (let selectedAnnotation of selectedOnes) {
                        instance.removeParticle(selectedAnnotation);
                    }
                }
            }
        ).button({
            icon: "ui-icon-trash",
            text: false
        });
    }

    /**
     * Inits the edit button.
     */
    __initEditButton() {
        let instance = this;
        $("#edit-annotation-button").click(
            function(){
                //If more than one annotation selected or none of them, warn.
                let selected = $( "#annotation-list .ui-selected");
                if (selected.length === 0 || selected.length > 1){
                    $( "#select-one-warn").dialog({
                        title: "Warning!"
                    });
                }else{
                    selected = selected[0]
                    let uuid = selected.attributes.uuid.value;
                    let dialog = $( "#tag" );
                    dialog.dialog({
                        title: "Editing...",
                        modal: true,
                        open: function(){
                            $("#tag-content").val(selected.textContent).on(
                                "keypress",
                                function(e) {
                                    switch(e.keyCode) {
                                        case 13:
                                            $('.ui-button:contains("Save")').click();
                                        break;
                                        case 27:
                                            $('.ui-button:contains("Close")').click();
                                        break;
                                    }
                                }
                            );
                        },
                        buttons: {
                            "Save": function(){
                                let editingLi = $("#annotation-list li[uuid='" + uuid + "']")[0];
                                let finalTagValue = $("#tag-content")[0].value;
                                editingLi.textContent = finalTagValue;
                                instance.__changeTagValue(uuid, finalTagValue);
                                $(this).dialog("close");
                            },
                            Cancel: function() {
                                $(this).dialog("close");
                            }
                        }
                    });
                }
            }
        ).button({
            icon: "ui-icon-pencil",
            text: false
        });
    }

    /**
     * It will return the annotations set.
     * @return {Object} An object containing a list with the annotations.
     */
    toJSON() {
        let annotationList = [];
        for (let annotation of this.elements) {
            let temp = {};
            let threeObject = annotation.sphere.threeObject;
            temp["tag"] = threeObject.userData;
            temp["points"] = [threeObject.position];
            annotationList.push(temp);
        }
        return {annotations: annotationList};
    }

    /**
     * Toggles nothing, 'cause it's yet unimplemented.
     */
    toggleColor() {
        console.warn("Method toggleColor unimplemented");
    }
}