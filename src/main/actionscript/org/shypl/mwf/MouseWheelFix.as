package org.shypl.mwf {
	import flash.display.DisplayObject;
	import flash.display.InteractiveObject;
	import flash.display.Stage;
	import flash.display.StageDisplayState;
	import flash.errors.IllegalOperationError;
	import flash.events.FullScreenEvent;
	import flash.events.MouseEvent;
	import flash.external.ExternalInterface;
	import flash.geom.Point;
	import flash.text.TextField;
	
	public class MouseWheelFix {
		private static var _initialized:Boolean = false;
		private static var _stage:Stage;
		private static var _disableDefault:Boolean;
		
		public static function initialize(stage:Stage):Boolean {
			if (_initialized) {
				throw new IllegalOperationError("MouseWheelFix already initialized");
			}
			_initialized = true;
			
			if (!ExternalInterface.available) {
				return false;
			}
			
			const id:String = ExternalInterface.objectID;
			
			if (!id) {
				return false;
			}
			
			_stage = stage;
			
			if (!ExternalInterface.call("shypl_mwf.initialized")) {
				ExternalInterface.call(new Adapter().toString());
			}
			
			ExternalInterface.addCallback('shypl_mwf_handleWheel', handleWheel);
			ExternalInterface.call("shypl_mwf.fix", id);
			
			_stage.addEventListener(MouseEvent.MOUSE_WHEEL, stage_mouseWheelHandler, true);
			_stage.addEventListener(FullScreenEvent.FULL_SCREEN, stage_fullScreenHandler);
			_disableDefault = _stage.displayState === StageDisplayState.NORMAL;
			
			return true;
		}
		
		private static function handleWheel(deltaX:int, deltaY:int, ctrlKey:Boolean, altKey:Boolean, shiftKey:Boolean):Boolean {
			if (deltaX == 0 && deltaY == 0) {
				return false;
			}
			
			var tmp:DisplayObject = _stage.getObjectsUnderPoint(new Point(_stage.mouseX, _stage.mouseY)).pop() as DisplayObject;
			var target:InteractiveObject;
			while (tmp != null) {
				target = tmp as InteractiveObject;
				if (target) {
					break;
				}
				tmp = tmp.parent;
			}
			if (!target) {
				return false;
			}
			
			const event:MouseWheelFixEvent = new MouseWheelFixEvent(target.mouseX, target.mouseY, ctrlKey, altKey, shiftKey, deltaX, deltaY);
			
			if (target is TextField) {
				TextField(target).scrollH -= deltaX;
				TextField(target).scrollV -= deltaY;
				event.preventDefault();
			}
			
			target.dispatchEvent(event);
			
			return event.isDefaultPrevented();
		}
		
		private static function stage_mouseWheelHandler(event:MouseEvent):void {
			if (!(event is MouseWheelFixEvent)) {
				if (_disableDefault || event.delta === 0) {
					event.stopPropagation();
					event.preventDefault();
				}
			}
		}
		
		private static function stage_fullScreenHandler(event:FullScreenEvent):void {
			_disableDefault = !event.fullScreen;
		}
	}
}
