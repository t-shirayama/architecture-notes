# フロントエンド系

UI、状態管理、画面単位の分割、フロントエンドとバックエンドの境界を扱うカテゴリです。

## 作成済みドキュメント

| アーキテクチャ | 概要 |
| --- | --- |
| [MVC](./MVC.md) | Model、View、Controllerに分け、入力処理、表示、状態や業務データを分離する基本的なUIアーキテクチャです。 |
| [MVP](./MVP.md) | ModelとViewの間にPresenterを置き、表示ロジックや入力処理の調整をPresenterに集めるUIアーキテクチャです。 |
| [MVVM](./MVVM.md) | ViewとModelの間にViewModelを置き、画面状態と操作をView向けに表現するUIアーキテクチャです。 |
| [Flux](./Flux.md) | Action、Dispatcher、Store、Viewによる単方向データフローでUI状態を管理するアーキテクチャです。 |
| [Redux Architecture](./Reduxアーキテクチャ.md) | 単一のStore、Action、Reducerによってアプリケーション状態を予測可能に管理する構成です。 |
| [Feature-Sliced Design](./Feature-Sliced Design.md) | フロントエンドコードをapp、pages、widgets、features、entities、sharedなどの層とスライスで整理する設計手法です。 |
| [Atomic Design](./Atomic Design.md) | UIをatoms、molecules、organisms、templates、pagesのような粒度で整理するデザインシステムの考え方です。 |
| [Micro Frontends](./マイクロフロントエンド.md) | フロントエンドを複数の独立したアプリケーションや機能単位に分割する構成です。 |
| [Islands Architecture](./アイランドアーキテクチャ.md) | 静的HTMLを基本にし、必要な部分だけを独立したインタラクティブな島としてハイドレーションする構成です。 |
| [Backend for Frontend](./Backend for Frontend.md) | Web、モバイル、管理画面などフロントエンドの種類ごとに専用のバックエンドAPI層を設けるパターンです。 |

## 参考

- 同カテゴリの作成済みドキュメントをもとに更新。
