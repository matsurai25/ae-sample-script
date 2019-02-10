/// <reference types="types-for-adobe/aftereffects/2018"/>

try {
  app.beginUndoGroup('barabara PreComp');
  main();
  app.endUndoGroup();
} catch (e) {
  app.endUndoGroup();
  app.executeCommand(CommandID.Undo);
  alert(e);
}

// メイン処理
function main() {
  var activeComp = getActiveCompOrException();
  var activeLayers = activeComp.selectedLayers;
  var preComposedItems: CompItem[] = [];

  // 選択されたレイヤーを全てプリコンポーズする
  for (let i = 0; i < activeLayers.length; i++) {
    const layer = activeLayers[i];
    preComposedItems.push(
      activeComp.layers.precompose(
        [layer.index],
        layer.name,
        true
      )
    );
  }

  // 生成されたcompItemsにそれぞれ処理を適応する
  for (let i = 0; i < preComposedItems.length; i++) {
    const preComposedItem = preComposedItems[i];
    transportEffectsToAdjustmentLayer(preComposedItem)
  }
};

/**
 * 現在アクティブなコンポジションを取得する
 * @return CompItem
 */
function getActiveCompOrException(): CompItem {
  const item = app.project.activeItem;
  if (!(item instanceof CompItem)) {
    throw new Error('CompItem is not selected');
  };

  return item;
};

/**
 * 調整レイヤーにエフェクトをそれぞれ移植する
 */
function transportEffectsToAdjustmentLayer(compItem: CompItem) {
  compItem.openInViewer()

  // 一個目のレイヤーを取得する
  const layer = compItem.layer(1)

  // レイヤーのエフェクトを全部取る
  const effects: PropertyBase[] = []
  const effectGroup = (layer.property('ADBE Effect Parade') as PropertyGroup)
  for (let i = 0; i < effectGroup.numProperties; i++) {
    effects.push(effectGroup.property(i + 1));
  }

  // エフェクトごとに調整レイヤーを作ってエフェクトを適応する
  for (let i = 0; i < effects.length; i++) {
    app.executeCommand(CommandID.NewAdjustmentLayer)
    const effect = effects[effects.length - (i+1)] as PropertyGroup
    app.executeCommand(CommandID.DeselectAll)
    effect.selected = true
    app.executeCommand(CommandID.Copy)
    app.executeCommand(CommandID.DeselectAll)

    // 開始時間をあわせる
    const keyTime = getFirstKeyTime(filterWithHasKeyFrames(getPropertiesByPropertyGroup(effect)));
    compItem.time = keyTime
    compItem.layer(1).selected = true
    app.executeCommand(CommandID.Paste)
    app.executeCommand(CommandID.DeselectAll)
  }

  // エフェクトを全部消す
  for (let i = 0; i < effects.length; i++) {
    effectGroup.property(1).remove()
  }
  
  app.executeCommand(CommandID.Close)
}

/**
 * PropertyGroupをPropertyの配列にして返す
 */
function getPropertiesByPropertyGroup(propertyGroup: PropertyGroup): Property[] {
  var properties = [];
  var r = function (propertyBase: PropertyBase) {
    if (propertyBase.propertyType === PropertyType.PROPERTY) {
      // Property だったらpropertiesに入れる
      properties.push(propertyBase);
    } else {
      for (var index = 0; index < (propertyBase as PropertyGroup).numProperties; index++) {
        r(propertyBase.property(index + 1));
      };
    };
  };
  r(propertyGroup);
  return properties;
};

/**
 * キーフレームを持っているPropertyのみ返す
 * @param properties 
 */
function filterWithHasKeyFrames(properties: Property[]): Property[] {
  var res = [];
  for (var index = 0; index < properties.length; index++) {
    var property = properties[index];
    if (property.numKeys > 0) {
      res.push(property);
    };
  };
  return res;
};

/**
 * キーフレームを持ってるプロパティから、一番最初に当たる時間のみ取得してくる
 * @param number 
 */
function getFirstKeyTime(properties: Property[]): number {
  var startTimes: number[] = [];
  for (var index = 0; index < properties.length; index++) {
    var property = properties[index];
    if (property.numKeys > 0) {
      const keytime = property.keyTime(1)
      if (keytime < 0) {
        throw new Error(`${property.name}の値が0より小さいです！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！`);
      }
    
      startTimes.push(property.keyTime(1))
    }
  };
  return startTimes.length > 0 ? Math.min(...startTimes) : 0;
};

