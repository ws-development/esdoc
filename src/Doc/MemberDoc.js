import AbstractDoc from './AbstractDoc.js';
import MethodDoc from './MethodDoc.js';
import ParamParser from '../Parser/ParamParser.js'
import babelGenerator from 'babel-generator';

/**
 * Doc Class from Member Expression AST node.
 */
export default class MemberDoc extends AbstractDoc {
  /**
   * apply own tag.
   * @private
   */
  _apply() {
    super._apply();

    delete this._value.export;
    delete this._value.importPath;
    delete this._value.importStyle;
  }

  /** specify ``member`` to kind. */
  _$kind() {
    super._$kind();
    this._value.kind = 'member';
  }

  /** use static property in class */
  _$static() {
    let parent = this._node.parent;
    while (parent) {
      if (parent.type === 'ClassMethod') {
        this._value.static = parent.static;
        break;
      }
      parent = parent.parent;
    }
  }

  /** take out self name from self node */
  _$name() {
    let name;
    if (this._node.left.computed) {
      const expression = babelGenerator(this._node.left.property).code.replace(/^this/, '');
      name = `[${expression}]`;
    } else {
      name = this._flattenMemberExpression(this._node.left).replace(/^this\./, '');
    }
    this._value.name = name;
  }

  /** borrow {@link MethodDoc#@_memberof} */
  _$memberof() {
    MethodDoc.prototype._$memberof.call(this);
  }

  /** if @type is not exists, guess type by using self node */
  _$type() {
    super._$type();
    if (this._value.type) return;

    this._value.type = ParamParser.guessType(this._node.right);
  }
}
