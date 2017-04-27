package org.shypl.mwf {
	import flash.events.MouseEvent;
	
	public class MouseWheelFixEvent extends MouseEvent {
		private var _deltaX:int;
		private var _deltaY:int;
		private var _defaultPrevented:Boolean;
		
		public function MouseWheelFixEvent(localX:Number, localY:Number, ctrlKey:Boolean, altKey:Boolean, shiftKey:Boolean, deltaX:int, deltaY:int) {
			super(MOUSE_WHEEL, true, false, localX, localY, null, ctrlKey, altKey, shiftKey, false, deltaY);
			_deltaX = deltaX;
			_deltaY = deltaY;
		}
		
		public function get deltaX():int {
			return _deltaX;
		}
		
		public function get deltaY():int {
			return _deltaY;
		}
		
		override public function preventDefault():void {
			_defaultPrevented = true;
			super.preventDefault();
		}
		
		override public function isDefaultPrevented():Boolean {
			return _defaultPrevented || super.isDefaultPrevented();
		}
	}
}
